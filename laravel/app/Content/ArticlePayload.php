<?php

namespace App\Content;

use App\Models\Article;

/** An article in the stage-1 `content/articles.json` shape, built from its current version. */
class ArticlePayload
{
    /** Full record, including fields the site never shows (for the validator and agents). */
    public static function full(Article $a): array
    {
        $version = $a->currentVersion;

        return [
            'slug' => $a->slug,
            'category' => $a->category_id,
            'level' => $a->level,
            'read_minutes' => $a->read_minutes,
            'keyword' => $a->keyword,
            ...($version?->content ?? []),
            'sources' => $version?->source_ids ?? [],
            'updated_at' => $a->content_updated_at?->toDateString(),
            'update_log' => $a->updateLog->map(fn ($l) => array_filter([
                'date' => $l->date->toDateString(),
                'public' => $l->public,
                'internal_note' => $l->internal_note,
            ], fn ($v) => $v !== null))->all(),
            'icon' => $a->icon,
        ];
    }

    /** What the build-time export API returns: no source ids, no internal notes (docs/spec.md §8.1). */
    public static function public(Article $a): array
    {
        $full = self::full($a);
        unset($full['sources'], $full['image_brief']); // image_brief is backend-only input for the featured-image generator
        $full['update_log'] = array_map(fn ($l) => ['date' => $l['date'], 'public' => $l['public']], $full['update_log']);

        return $full;
    }
}
