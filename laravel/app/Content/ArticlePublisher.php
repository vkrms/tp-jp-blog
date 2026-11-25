<?php

namespace App\Content;

use App\Models\Article;
use App\Models\ArticleUpdateLog;
use App\Models\ArticleVersion;
use App\Models\AuditLog;
use App\Models\Source;
use App\Support\ContentFiles;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Every change to what an article shows goes through here: new versions, publish, rollback, archive
 * (docs/spec.md §3.1, §9). Content is validated before it is stored; a change that affects the live
 * site triggers one rebuild.
 */
class ArticlePublisher
{
    public function __construct(private readonly SiteRebuild $rebuild) {}

    /**
     * Store a new version and make it current. Validated first; invalid content is not saved.
     *
     * @param  array  $content  title, eyebrow, answer_first, sections, faq, matome, related
     * @param  array{ja: string, en: string}|null  $publicNote  adds a public 更新履歴 line when given
     */
    public function saveVersion(Article $article, array $content, array $sourceIds, string $author,
        ?string $summary = null, ?array $publicNote = null, ?array $internalNote = null, ?int $runId = null): ArticleVersion
    {
        if (! in_array($author, ArticleVersion::AUTHORS, true)) {
            throw new InvalidArgumentException("unknown author {$author}");
        }

        $today = now()->toDateString();
        $payload = ArticlePayload::full($article);
        $payload = [...$payload, ...$content, 'sources' => array_values($sourceIds), 'updated_at' => $today];
        if ($publicNote) {
            $payload['update_log'][] = ['date' => $today, 'public' => $publicNote];
        }
        $this->assertValid($payload);

        $version = DB::transaction(function () use ($article, $content, $sourceIds, $author, $summary, $publicNote, $internalNote, $runId, $today) {
            $version = ArticleVersion::create([
                'article_id' => $article->id,
                'version' => (int) $article->versions()->max('version') + 1,
                'content' => $content,
                'source_ids' => array_values($sourceIds),
                'author' => $author,
                'run_id' => $runId,
                'change_summary' => $summary,
            ]);
            $article->update(['current_version_id' => $version->id, 'content_updated_at' => $today]);
            if ($publicNote) {
                ArticleUpdateLog::create([
                    'article_id' => $article->id,
                    'date' => $today,
                    'public' => $publicNote,
                    'internal_note' => $internalNote,
                    'sort' => (int) $article->updateLog()->max('sort') + 1,
                ]);
            }

            return $version;
        });

        AuditLog::record('edit', 'article', $article->slug, ['version' => $version->version, 'author' => $author, 'summary' => $summary]);
        $this->rebuildIfLive($article, "{$article->slug}: v{$version->version}");

        return $version;
    }

    public function publish(Article $article): void
    {
        $this->assertValid(ArticlePayload::full($article->load(['currentVersion', 'updateLog'])));
        $article->update(['status' => 'published', 'published_at' => $article->published_at ?? now()]);
        AuditLog::record('publish', 'article', $article->slug);
        $this->rebuild->trigger("{$article->slug}: published");
    }

    /** Point the article back at an earlier version (no new version is created). */
    public function rollback(Article $article, ArticleVersion $version): void
    {
        if ($version->article_id !== $article->id) {
            throw new InvalidArgumentException('version belongs to another article');
        }
        $from = $article->currentVersion?->version;
        $article->update(['current_version_id' => $version->id]);
        AuditLog::record('rollback', 'article', $article->slug, ['from' => $from, 'to' => $version->version]);
        $this->rebuildIfLive($article, "{$article->slug}: rolled back to v{$version->version}");
    }

    public function archive(Article $article): void
    {
        $wasLive = $article->status === 'published';
        $article->update(['status' => 'archived']);
        AuditLog::record('archive', 'article', $article->slug);
        if ($wasLive) {
            $this->rebuild->trigger("{$article->slug}: archived");
        }
    }

    /** @throws InvalidContent */
    public function assertValid(array $payload): void
    {
        $errors = $this->validator()->validate($payload)['errors'];
        if ($errors) {
            throw new InvalidContent($errors);
        }
    }

    public function validator(): ArticleValidator
    {
        return new ArticleValidator(
            (new ContentFiles(config('content.path')))->json('rules.json'),
            Source::pluck('id')->all(),
            Article::pluck('slug')->all(),
        );
    }

    private function rebuildIfLive(Article $article, string $reason): void
    {
        if ($article->status === 'published') {
            $this->rebuild->trigger($reason);
        }
    }
}
