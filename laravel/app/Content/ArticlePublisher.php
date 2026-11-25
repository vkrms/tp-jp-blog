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
    private bool $rebuildQueued = false;

    public function __construct(private readonly SiteRebuild $rebuild) {}

    /**
     * Store a new version and make it current. Validated first; invalid content is not saved.
     *
     * @param  array  $content  title, eyebrow, answer_first, sections, faq, matome, related
     * @param  array{ja: string, en: string}|null  $publicNote  a substantive change: adds a public 更新履歴 line
     *                                                    and moves the public update date to today
     */
    public function saveVersion(Article $article, array $content, array $sourceIds, string $author,
        ?string $summary = null, ?array $publicNote = null, ?array $internalNote = null, ?int $runId = null): ArticleVersion
    {
        if (! in_array($author, ArticleVersion::AUTHORS, true)) {
            throw new InvalidArgumentException("unknown author {$author}");
        }

        $today = now()->toDateString();
        $payload = ArticlePayload::full($article);
        $payload = [...$payload, ...$content, 'sources' => array_values($sourceIds)];
        if ($publicNote) {
            $payload['update_log'][] = ['date' => $today, 'public' => $publicNote];
            $payload['updated_at'] = $today;
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
            // The public update date moves only with a substantive change, i.e. one that gets a public
            // 更新履歴 line; cosmetic fixes keep the date (agents/seo-ja.md §2: no date "freshening").
            $article->update(['current_version_id' => $version->id]
                + ($publicNote ? ['content_updated_at' => $today] : []));
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

    /**
     * Change card fields (category, level, read_minutes, keyword, icon) without a new content version.
     * They are shown on the site too, so the same validation and rebuild apply.
     */
    public function updateCard(Article $article, array $attributes): void
    {
        $article->fill(array_intersect_key($attributes, array_flip(['category_id', 'level', 'read_minutes', 'keyword', 'icon'])));
        if (! $article->isDirty()) {
            return;
        }
        $changed = array_keys($article->getDirty());
        $this->assertValid(ArticlePayload::full($article->loadMissing(['currentVersion', 'updateLog'])));
        $article->save();
        AuditLog::record('edit', 'article', $article->slug, ['fields' => $changed]);
        $this->rebuildIfLive($article, "{$article->slug}: card updated");
    }

    public function publish(Article $article): void
    {
        $this->assertValid(ArticlePayload::full($article->load(['currentVersion', 'updateLog'])));
        $article->update(['status' => 'published', 'published_at' => $article->published_at ?? now()]);
        AuditLog::record('publish', 'article', $article->slug);
        $this->rebuildAfterCommit("{$article->slug}: published");
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
            $this->rebuildAfterCommit("{$article->slug}: archived");
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
        return ArticleValidator::fromDatabase();
    }

    private function rebuildIfLive(Article $article, string $reason): void
    {
        if ($article->status === 'published') {
            $this->rebuildAfterCommit($reason);
        }
    }

    /**
     * The site must never be rebuilt for a change that was rolled back: inside a transaction the
     * trigger waits for the outermost commit and is dropped on rollback; outside one it runs now.
     */
    private function rebuildAfterCommit(string $reason): void
    {
        // One save may touch the card and the content: queue a single trigger per transaction.
        if ($this->rebuildQueued) {
            return;
        }
        $this->rebuildQueued = true;
        DB::afterCommit(function () use ($reason) {
            $this->rebuildQueued = false;
            $this->rebuild->trigger($reason);
        });
    }
}
