<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Build-time export API (docs/spec.md §8.1). */
class ExportApiTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'test-token';

    protected function setUp(): void
    {
        parent::setUp();
        config(['content.export_token' => self::TOKEN]);
        $this->artisan('content:import')->assertSuccessful();
    }

    private function export(string $path)
    {
        return $this->withToken(self::TOKEN)->getJson("/api/export/{$path}");
    }

    public function test_rejects_missing_or_wrong_token(): void
    {
        $this->getJson('/api/export/articles')->assertUnauthorized();
        $this->withToken('wrong')->getJson('/api/export/articles')->assertUnauthorized();
    }

    public function test_is_closed_when_no_token_is_configured(): void
    {
        config(['content.export_token' => null]);
        $this->withToken('')->getJson('/api/export/articles')->assertStatus(503);
    }

    public function test_articles_match_the_stage1_files_minus_private_fields(): void
    {
        $files = json_decode(file_get_contents(config('content.path').'/articles.json'), true);
        $exported = $this->export('articles')->assertOk()->json();

        $this->assertCount(count($files), $exported);
        foreach ($files as $i => $a) {
            unset($a['sources'], $a['review_status']);
            $a['update_log'] = array_map(fn ($l) => ['date' => $l['date'], 'public' => $l['public']], $a['update_log']);
            ksort($a);
            $e = $exported[$i];
            ksort($e);
            $this->assertSame($a, $e, $a['slug']);
        }
    }

    public function test_only_published_articles_are_exported(): void
    {
        Article::where('slug', 'what-is-affiliate')->update(['status' => 'draft']);

        $slugs = collect($this->export('articles')->json())->pluck('slug');
        $this->assertNotContains('what-is-affiliate', $slugs);
        $this->assertSame(Article::published()->count(), $slugs->count());
    }

    public function test_categories_and_glossary_keep_their_file_shape(): void
    {
        $dir = config('content.path');
        $this->assertSame(json_decode(file_get_contents("{$dir}/categories.json"), true), $this->export('categories')->json());
        $this->assertSame(json_decode(file_get_contents("{$dir}/glossary.json"), true), $this->export('glossary')->json());
    }
}
