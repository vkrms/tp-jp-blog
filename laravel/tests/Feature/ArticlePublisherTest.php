<?php

namespace Tests\Feature;

use App\Content\ArticlePublisher;
use App\Content\InvalidContent;
use App\Content\SiteRebuild;
use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use Tests\TestCase;

class ArticlePublisherTest extends TestCase
{
    use RefreshDatabase;

    private ArticlePublisher $publisher;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.github.dispatch_token' => 'gh-token', 'services.github.repo' => 'owner/repo']);
        Http::fake(['api.github.com/repos/owner/repo/*' => Http::response(null, 204)]);
        $this->artisan('content:import')->assertSuccessful();
        $this->publisher = app(ArticlePublisher::class);
    }

    private function article(string $slug = 'what-is-affiliate'): Article
    {
        return Article::where('slug', $slug)->firstOrFail();
    }

    private function dispatches(): int
    {
        return Http::recorded(fn (Request $r) => str_contains($r->url(), '/dispatches'))->count();
    }

    public function test_save_version_creates_next_version_and_triggers_one_rebuild(): void
    {
        $article = $this->article();
        $content = $article->currentVersion->content;
        $content['eyebrow'] = ['新しい見出し', 'New eyebrow'];

        $version = $this->publisher->saveVersion($article, $content, $article->currentVersion->source_ids, 'admin', 'eyebrow fix');

        $article->refresh();
        $this->assertSame(2, $version->version);
        $this->assertSame($version->id, $article->current_version_id);
        $this->assertSame(now()->toDateString(), $article->content_updated_at->toDateString());
        $this->assertSame(1, $this->dispatches());
        Http::assertSent(fn (Request $r) => $r->url() === 'https://api.github.com/repos/owner/repo/dispatches'
            && $r['event_type'] === 'content-updated' && $r->hasHeader('Authorization', 'Bearer gh-token'));
        $this->assertTrue(AuditLog::where('action', 'edit')->where('subject_id', 'what-is-affiliate')->exists());
    }

    public function test_public_note_adds_an_update_log_line(): void
    {
        $article = $this->article();
        $before = $article->updateLog()->count();

        $this->publisher->saveVersion($article, $article->currentVersion->content, $article->currentVersion->source_ids,
            'admin', null, ['ja' => '表現を修正', 'en' => 'Wording fixed']);

        $this->assertSame($before + 1, $article->updateLog()->count());
        $this->assertSame('表現を修正', $article->updateLog()->get()->last()->public['ja']);
    }

    public function test_invalid_content_is_not_saved_and_does_not_rebuild(): void
    {
        $article = $this->article();
        $content = $article->currentVersion->content;
        $content['title'] = ['必ず稼げる', 'Guaranteed income'];

        try {
            $this->publisher->saveVersion($article, $content, [], 'admin');
            $this->fail('expected InvalidContent');
        } catch (InvalidContent $e) {
            $this->assertNotEmpty(array_filter($e->errors, fn ($m) => str_contains($m, '必ず稼げる')));
        }

        $this->assertSame(1, $article->versions()->count());
        $this->assertSame(0, $this->dispatches());
    }

    public function test_draft_edits_do_not_rebuild_but_publishing_does(): void
    {
        $article = $this->article();
        $article->update(['status' => 'pending_review']);

        $this->publisher->saveVersion($article, $article->currentVersion->content, $article->currentVersion->source_ids, 'writer');
        $this->assertSame(0, $this->dispatches());

        $this->publisher->publish($article->refresh());
        $this->assertSame('published', $article->refresh()->status);
        $this->assertSame(1, $this->dispatches());
    }

    public function test_rollback_switches_the_current_version(): void
    {
        $article = $this->article();
        $v1 = $article->currentVersion;
        $content = $v1->content;
        $content['eyebrow'] = ['別の見出し', 'Other eyebrow'];
        $this->publisher->saveVersion($article, $content, $v1->source_ids, 'admin');

        $this->publisher->rollback($article->refresh(), $v1);

        $this->assertSame($v1->id, $article->refresh()->current_version_id);
        $this->assertSame(2, $article->versions()->count(), 'rollback does not create a version');
        $this->assertSame(2, $this->dispatches());
        $this->assertSame(['from' => 2, 'to' => 1], AuditLog::where('action', 'rollback')->first()->details);
    }

    public function test_archive_removes_from_export_and_rebuilds(): void
    {
        config(['content.export_token' => 't']);
        $this->publisher->archive($this->article());

        $slugs = collect($this->withToken('t')->getJson('/api/export/articles')->json())->pluck('slug');
        $this->assertNotContains('what-is-affiliate', $slugs);
        $this->assertSame(1, $this->dispatches());
    }

    public function test_failed_or_unconfigured_trigger_is_recorded(): void
    {
        Sleep::fake();
        config(['services.github.repo' => 'owner/broken']);
        Http::fake(['api.github.com/repos/owner/broken/*' => Http::response(['message' => 'Bad credentials'], 401)]);
        $this->assertFalse(app(SiteRebuild::class)->trigger('test'));
        Http::assertSentCount(3); // 1 try + 2 retries
        $this->assertFalse(Setting::get('last_rebuild')['ok']);

        config(['services.github.repo' => null]);
        $this->assertFalse(app(SiteRebuild::class)->trigger('test'));
        $this->assertStringContainsString('not configured', Setting::get('last_rebuild')['error']);
    }
}
