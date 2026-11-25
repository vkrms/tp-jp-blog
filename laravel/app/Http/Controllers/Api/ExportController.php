<?php

namespace App\Http\Controllers\Api;

use App\Content\ArticlePayload;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\GlossaryTerm;
use Illuminate\Http\JsonResponse;

/**
 * Export for the Astro build (docs/spec.md §8.1). Shapes match the stage-1 content/ files, so the
 * Astro components render API data unchanged. Fields the site never shows (source ids, internal notes)
 * are not exported.
 */
class ExportController extends Controller
{
    private const JSON_FLAGS = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;

    public function articles(): JsonResponse
    {
        $articles = Article::published()
            ->with(['category', 'currentVersion', 'updateLog'])
            ->orderBy('id')
            ->get()
            ->map(fn (Article $a) => ArticlePayload::public($a));

        return $this->json($articles);
    }

    public function categories(): JsonResponse
    {
        return $this->json(Category::orderBy('sort')->get()->map(fn (Category $c) => [
            'id' => $c->id,
            't' => [$c->title['ja'], $c->title['en']],
            'c' => $c->color,
        ]));
    }

    public function glossary(): JsonResponse
    {
        return $this->json(GlossaryTerm::orderBy('sort')->get()->map(fn (GlossaryTerm $g) => [
            'term_ja' => $g->term['ja'],
            'term_en' => $g->term['en'],
            'def_ja' => $g->definition['ja'],
            'def_en' => $g->definition['en'],
            'kind' => $g->kind,
        ]));
    }

    /** Latest content change, for "is a rebuild needed" checks (optional, §11.2). */
    public function meta(): JsonResponse
    {
        $latest = Article::published()->max('updated_at');

        return $this->json([
            'articles' => Article::published()->count(),
            'last_changed_at' => $latest ? \Illuminate\Support\Carbon::parse($latest)->toIso8601String() : null,
        ]);
    }

    private function json(mixed $data): JsonResponse
    {
        return response()->json($data, 200, [], self::JSON_FLAGS);
    }
}
