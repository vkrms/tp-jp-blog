<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\ArticleUpdateLog;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Fact;
use App\Models\GlossaryTerm;
use App\Models\Setting;
use App\Models\Source;
use App\Models\TopicQueueItem;
use App\Support\ContentFiles;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * One-off import of the stage-1 content/ files into the database (docs/spec.md §10).
 *
 * Articles are already live in stage 1, so they come in as `published`, version 1, author `seed`.
 * Article content is copied verbatim (no [ja, en] → {ja, en} normalisation yet).
 */
class ContentImport extends Command
{
    protected $signature = 'content:import
        {--path= : content/ folder (default: config content.path)}
        {--fresh : wipe all content tables before importing}';

    protected $description = 'Import content/ files (articles, sources, facts, categories, glossary, queue, policy) into the database';

    /** Tables owned by the import, in delete order. */
    private const TABLES = ['fact_article', 'article_update_log', 'topic_queue', 'facts', 'glossary_terms',
        'sources', 'settings', 'article_versions', 'articles', 'categories'];

    /** Fields of an article that live in the version content (the rest are columns on `articles`). */
    public const CONTENT_FIELDS = ['title', 'eyebrow', 'answer_first', 'sections', 'faq', 'matome', 'related'];

    private array $warnings = [];

    public function handle(): int
    {
        $files = new ContentFiles($this->option('path') ?: config('content.path'));

        if (Article::exists() && ! $this->option('fresh')) {
            $this->error('Content tables are not empty. Re-run with --fresh to wipe and re-import.');

            return self::FAILURE;
        }

        DB::transaction(function () use ($files) {
            if ($this->option('fresh')) {
                $this->wipe();
            }
            $this->importCategories($files->json('categories.json'));
            $this->importSources($files->json('sources.json'));
            $this->importGlossary($files->json('glossary.json'));
            $articles = $this->importArticles($files->json('articles.json'));
            $this->importFacts($files->yaml('facts.yaml'), $articles);
            $this->importQueue($files->json('queue.json'));
            $this->importSettings($files->yaml('policy.yaml'));
        });

        foreach ($this->warnings as $w) {
            $this->warn($w);
        }
        $this->table(['table', 'rows'], collect(['categories', 'sources', 'glossary_terms', 'articles', 'article_versions',
            'article_update_log', 'facts', 'fact_article', 'topic_queue', 'settings'])
            ->map(fn ($t) => [$t, DB::table($t)->count()])->all());

        return self::SUCCESS;
    }

    private function wipe(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('articles')->update(['current_version_id' => null]);
        foreach (self::TABLES as $t) {
            DB::table($t)->delete();
        }
        Schema::enableForeignKeyConstraints();
    }

    private function importCategories(array $rows): void
    {
        foreach ($rows as $i => $c) {
            Category::create(['id' => $c['id'], 'title' => ContentFiles::pair($c['t']), 'color' => $c['c'], 'sort' => $i]);
        }
    }

    private function importSources(array $data): void
    {
        foreach ($data['sources'] as $s) {
            Source::create([
                'id' => $s['id'],
                'name' => ContentFiles::pair($s['name']),
                'url' => $s['url'],
                'published_at' => ContentFiles::date($s['published'] ?? null),
                'type' => $s['type'],
                'tier' => $s['tier'] ?? 1,
                'refresh' => $s['refresh'] ?? null,
                'fetch_allowed' => ($s['type'] ?? null) !== 'internal',
            ]);
        }
    }

    private function importGlossary(array $rows): void
    {
        foreach ($rows as $i => $g) {
            GlossaryTerm::create([
                'term' => ['ja' => $g['term_ja'], 'en' => $g['term_en']],
                'definition' => ['ja' => $g['def_ja'], 'en' => $g['def_en']],
                'kind' => $g['kind'],
                'sort' => $i,
            ]);
        }
    }

    /** @return array<string, Article> by slug */
    private function importArticles(array $rows): array
    {
        $bySlug = [];
        foreach ($rows as $a) {
            $updated = $a['updated_at'];
            $log = $a['update_log'] ?? [];
            $article = Article::create([
                'slug' => $a['slug'],
                'category_id' => $a['category'],
                'level' => $a['level'],
                'read_minutes' => $a['read_minutes'],
                'keyword' => $a['keyword'] ?? null,
                'icon' => $a['icon'] ?? null,
                'status' => 'published',
                'published_at' => $log[0]['date'] ?? $updated,
                'content_updated_at' => $updated,
            ]);
            $version = ArticleVersion::create([
                'article_id' => $article->id,
                'version' => 1,
                'content' => array_intersect_key($a, array_flip(self::CONTENT_FIELDS)),
                'source_ids' => $a['sources'] ?? [],
                'author' => 'seed',
                'change_summary' => 'Imported from content/articles.json',
            ]);
            $article->update(['current_version_id' => $version->id]);
            foreach ($log as $i => $l) {
                ArticleUpdateLog::create([
                    'article_id' => $article->id,
                    'date' => $l['date'],
                    'public' => $l['public'],
                    'internal_note' => $l['internal_note'] ?? null,
                    'sort' => $i,
                ]);
            }
            foreach (array_diff($a['sources'] ?? [], Source::pluck('id')->all()) as $missing) {
                $this->warnings[] = "{$a['slug']}: source {$missing} is not in sources.json";
            }
            $bySlug[$a['slug']] = $article;
        }

        return $bySlug;
    }

    /** @param array<string, Article> $articles */
    private function importFacts(array $data, array $articles): void
    {
        foreach ($data['facts'] as $f) {
            if (! empty($f['source_id']) && ! Source::whereKey($f['source_id'])->exists()) {
                $this->createMissingSource($f);
            }
            // facts.yaml values are descriptive working notes, not ja/en text fragments yet (§3.2):
            // keep them in internal_note, `value` stays empty until the placeholder migration.
            $note = trim(($f['value'] ?? '').(isset($f['note']) ? "\n".$f['note'] : ''));
            $fact = Fact::create([
                'fact_id' => $f['fact_id'],
                'value' => null,
                'internal_note' => $note ?: null,
                'source_id' => $f['source_id'] ?? null,
                'source_url' => $f['source_url'] ?? null,
                'source_date' => isset($f['source_date']) ? (string) $f['source_date'] : null,
                'refresh' => $f['refresh'],
                'checked_at' => $f['checked_at'] ?? null,
            ]);
            foreach ($f['used_in'] ?? [] as $slug) {
                if (! isset($articles[$slug])) {
                    $this->warnings[] = "fact {$f['fact_id']}: used_in article {$slug} does not exist";

                    continue;
                }
                $fact->articles()->attach($articles[$slug]->id);
            }
        }
    }

    /** A fact points at a source that is not in sources.json: register a minimal entry and say so. */
    private function createMissingSource(array $fact): void
    {
        $url = (string) ($fact['source_url'] ?? '');
        $internal = str_starts_with($url, 'internal:');
        Source::create([
            'id' => $fact['source_id'],
            'name' => ['ja' => $fact['source_id'], 'en' => $fact['source_id']],
            'url' => $url,
            'published_at' => ContentFiles::date((string) ($fact['source_date'] ?? '')),
            'type' => $internal ? 'internal' : 'news',
            'fetch_allowed' => ! $internal,
        ]);
        $this->warnings[] = "source {$fact['source_id']} (from fact {$fact['fact_id']}) was missing from sources.json; created "
            .($internal ? 'as internal, fetching disabled' : 'as type news')
            .' — check its name and type in the admin';
    }

    private function importQueue(array $data): void
    {
        foreach ($data['queue'] as $q) {
            TopicQueueItem::create([
                'keyword' => $q['keyword'],
                'topic' => $q['topic'],
                'monthly_volume' => $q['monthly'] ?? null,
                'status' => $q['status'],
                'reason' => $q['reason'] ?? null,
            ]);
        }
    }

    /** policy.yaml seeds the settings table; after import the database is the source of truth. */
    private function importSettings(array $policy): void
    {
        $limits = $policy['limits'] ?? [];
        Setting::put('paused', (bool) ($policy['paused'] ?? false));
        Setting::put('publish_mode', $policy['publish_mode'] ?? 'auto');
        Setting::put('max_new_articles_per_week', (int) ($limits['max_new_articles_per_week'] ?? 2));
        Setting::put('max_changed_articles_per_run', (int) ($limits['max_changed_articles_per_run'] ?? 10));
        Setting::put('report_recipients', []);
        Setting::put('ai_monthly_budget_usd', null);
        Setting::put('ai_reserved_for_agents_usd', null);
    }
}
