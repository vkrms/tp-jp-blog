<?php

namespace Tests\Feature;

use App\Console\Commands\ContentImport;
use App\Models\Article;
use App\Models\Fact;
use App\Models\Setting;
use App\Models\Source;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Imports the real repo content/ folder (docs/spec.md §10). */
class ContentImportTest extends TestCase
{
    use RefreshDatabase;

    private function files(string $name): array
    {
        return json_decode(file_get_contents(config('content.path')."/{$name}"), true);
    }

    public function test_imports_every_article_as_published_version_one(): void
    {
        $this->artisan('content:import')->assertSuccessful();

        $source = $this->files('articles.json');
        $this->assertSame(count($source), Article::published()->count());

        foreach ($source as $a) {
            $article = Article::where('slug', $a['slug'])->firstOrFail();
            $version = $article->currentVersion;
            $this->assertSame(1, $version->version);
            $this->assertSame('seed', $version->author);
            $this->assertSame($a['sources'], $version->source_ids);
            // Content is kept verbatim (stage-1 format), field by field.
            foreach (ContentImport::CONTENT_FIELDS as $field) {
                if (array_key_exists($field, $a)) {
                    $this->assertSame($a[$field], $version->content[$field], "{$a['slug']}.{$field}");
                }
            }
            $this->assertSame(count($a['update_log']), $article->updateLog()->count());
        }
    }

    public function test_links_facts_to_articles_and_registers_missing_sources(): void
    {
        $this->artisan('content:import')->assertSuccessful();

        $this->assertEqualsCanonicalizing(['earn-or-not', 'income-guide'],
            Fact::find('jao.survey.share_30k')->articles->pluck('slug')->all());
        $this->assertNull(Fact::find('jao.survey.share_30k')->value, 'values wait for the placeholder migration');

        $internal = Source::find('tp-messagings');
        $this->assertSame('internal', $internal->type);
        $this->assertFalse($internal->fetch_allowed);
    }

    public function test_seeds_settings_from_policy(): void
    {
        $this->artisan('content:import')->assertSuccessful();

        $this->assertSame('auto', Setting::get('publish_mode'));
        $this->assertFalse(Setting::get('paused'));
        $this->assertSame(2, Setting::get('max_new_articles_per_week'));
    }

    public function test_refuses_to_import_twice_without_fresh(): void
    {
        $this->artisan('content:import')->assertSuccessful();
        $this->artisan('content:import')->assertFailed();
        $this->artisan('content:import --fresh')->assertSuccessful();

        $this->assertSame(count($this->files('articles.json')), Article::count());
    }
}
