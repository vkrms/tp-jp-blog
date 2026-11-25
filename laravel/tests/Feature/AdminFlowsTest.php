<?php

namespace Tests\Feature;

use App\Filament\Pages\Settings;
use App\Filament\Resources\Articles\Pages\EditArticle;
use App\Filament\Resources\Articles\RelationManagers\VersionsRelationManager;
use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;
use Tests\TestCase;

/** Editing flows through the Filament UI (docs/spec.md §9). */
class AdminFlowsTest extends TestCase
{
    use RefreshDatabase;

    private Article $article;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.github.dispatch_token' => 'gh', 'services.github.repo' => 'owner/repo']);
        Http::fake(['api.github.com/*' => Http::response(null, 204)]);
        $this->artisan('content:import')->assertSuccessful();
        $this->actingAs(User::factory()->create());
        $this->article = Article::where('slug', 'what-is-affiliate')->firstOrFail();
    }

    private function editor()
    {
        return Livewire::test(EditArticle::class, ['record' => $this->article->getRouteKey()]);
    }

    private function contentJson(array $content): string
    {
        return json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function rebuilds(): int
    {
        return Http::recorded(fn (Request $r) => str_contains($r->url(), '/dispatches'))->count();
    }

    public function test_form_is_filled_from_the_current_version(): void
    {
        $this->editor()->assertSchemaStateSet([
            'category_id' => 'basics',
            'content_json' => $this->contentJson($this->article->currentVersion->content),
            'source_ids' => $this->article->currentVersion->source_ids,
        ]);
    }

    public function test_saving_edited_content_creates_a_version_and_rebuilds(): void
    {
        $content = $this->article->currentVersion->content;
        $content['eyebrow'] = ['新しい見出し', 'New eyebrow'];

        $this->editor()
            ->fillForm(['content_json' => $this->contentJson($content), 'change_summary' => 'eyebrow',
                'public_note_ja' => '見出しを更新', 'public_note_en' => 'Eyebrow updated'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->article->refresh();
        $this->assertSame(2, $this->article->currentVersion->version);
        $this->assertSame('admin', $this->article->currentVersion->author);
        $this->assertSame(['新しい見出し', 'New eyebrow'], $this->article->currentVersion->content['eyebrow']);
        $this->assertSame('見出しを更新', $this->article->updateLog->last()->public['ja']);
        $this->assertSame(1, $this->rebuilds());
    }

    public function test_card_and_content_change_in_one_save_trigger_one_rebuild(): void
    {
        $content = $this->article->currentVersion->content;
        $content['eyebrow'] = ['新しい見出し', 'New eyebrow'];

        $this->editor()->fillForm(['content_json' => $this->contentJson($content), 'read_minutes' => 9])
            ->call('save')->assertHasNoFormErrors();

        $this->assertSame(9, $this->article->refresh()->read_minutes);
        $this->assertSame(2, $this->article->currentVersion->version);
        $this->assertSame(1, $this->rebuilds());
    }

    public function test_saving_without_changes_creates_no_version(): void
    {
        $this->editor()->call('save')->assertHasNoFormErrors();

        $this->assertSame(1, $this->article->versions()->count());
        $this->assertSame(0, $this->rebuilds());
    }

    public function test_card_change_alone_updates_the_article_without_a_version(): void
    {
        $this->editor()->fillForm(['read_minutes' => 9])->call('save')->assertHasNoFormErrors();

        $this->assertSame(9, $this->article->refresh()->read_minutes);
        $this->assertSame(1, $this->article->versions()->count());
        $this->assertSame(1, $this->rebuilds());
    }

    public function test_validator_errors_block_the_save(): void
    {
        $content = $this->article->currentVersion->content;
        $content['title'] = ['必ず稼げる', 'Guaranteed'];

        $this->editor()->fillForm(['content_json' => $this->contentJson($content), 'read_minutes' => 9])
            ->call('save')
            ->assertHasFormErrors(['content_json']);

        $this->article->refresh();
        $this->assertSame(1, $this->article->versions()->count());
        $this->assertSame(6, $this->article->read_minutes, 'card change is rolled back with the content');
        $this->assertSame(0, $this->rebuilds());
    }

    public function test_broken_json_and_unknown_fields_are_rejected(): void
    {
        $this->editor()->fillForm(['content_json' => '{"title": '])->call('save')->assertHasFormErrors(['content_json']);
        $this->editor()->fillForm(['content_json' => '{"title": ["a","b"], "foo": 1}'])->call('save')->assertHasFormErrors(['content_json']);
        $this->assertSame(1, $this->article->versions()->count());
    }

    public function test_archive_and_publish_actions(): void
    {
        $this->editor()->callAction('archive');
        $this->assertSame('archived', $this->article->refresh()->status);

        $this->editor()->callAction('publish');
        $this->assertSame('published', $this->article->refresh()->status);
        $this->assertSame(2, $this->rebuilds());
    }

    public function test_rollback_from_the_versions_table(): void
    {
        $v1 = $this->article->currentVersion;
        $content = $v1->content;
        $content['eyebrow'] = ['別の見出し', 'Other'];
        $this->editor()->fillForm(['content_json' => $this->contentJson($content)])->call('save');
        $this->article->refresh();

        Livewire::test(VersionsRelationManager::class, ['ownerRecord' => $this->article, 'pageClass' => EditArticle::class])
            ->assertCanSeeTableRecords($this->article->versions)
            ->callAction(TestAction::make('diff')->table($v1))
            ->callAction(TestAction::make('rollback')->table($v1));

        $this->assertSame($v1->id, $this->article->refresh()->current_version_id);
        $this->assertTrue(AuditLog::where('action', 'rollback')->exists());
    }

    public function test_settings_save_and_manual_rebuild(): void
    {
        Livewire::test(Settings::class)
            ->assertSchemaStateSet(['publish_mode' => 'auto', 'paused' => false])
            ->fillForm(['paused' => true, 'ai_monthly_budget_usd' => 50, 'ai_reserved_for_agents_usd' => 20, 'report_recipients' => ['ops@example.com']])
            ->call('save')
            ->assertHasNoFormErrors()
            ->callAction('rebuild');

        $this->assertTrue(Setting::get('paused'));
        $this->assertSame(50.0, (float) Setting::get('ai_monthly_budget_usd'));
        $this->assertSame(['ops@example.com'], Setting::get('report_recipients'));
        $this->assertSame(1, $this->rebuilds());
        $this->assertTrue(Setting::get('last_rebuild')['ok']);
    }

    public function test_settings_reject_reserve_above_budget(): void
    {
        Livewire::test(Settings::class)
            ->fillForm(['ai_monthly_budget_usd' => 10, 'ai_reserved_for_agents_usd' => 20])
            ->call('save');

        $this->assertNull(Setting::get('ai_reserved_for_agents_usd'));
    }
}
