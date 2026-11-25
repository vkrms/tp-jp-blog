<?php

namespace Tests\Feature;

use App\Models\AgentRun;
use App\Models\Article;
use App\Models\Fact;
use App\Models\FetchLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Every admin screen renders with real imported content. */
class AdminPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('content:import')->assertSuccessful();
        $this->actingAs(User::factory()->create());
    }

    public function test_guests_are_sent_to_login(): void
    {
        auth()->logout();
        $this->get('/admin/articles')->assertRedirect('/admin/login');
    }

    public function test_all_pages_render(): void
    {
        $article = Article::where('slug', 'what-is-affiliate')->first();
        $run = AgentRun::create(['agent' => 'writer', 'started_at' => now(), 'status' => 'needs_human', 'report' => ['note' => 'テスト']]);
        FetchLog::create(['url' => 'https://example.com/', 'fetched_at' => now(), 'injection_suspected' => true, 'run_id' => $run->id]);

        $pages = [
            '/admin',
            '/admin/articles',
            "/admin/articles/{$article->id}/edit",
            '/admin/facts',
            '/admin/facts/create',
            '/admin/facts/'.Fact::first()->fact_id.'/edit',
            '/admin/sources',
            '/admin/sources/create',
            '/admin/sources/jao25/edit',
            '/admin/topic-queue',
            '/admin/topic-queue/create',
            '/admin/agent-runs',
            "/admin/agent-runs/{$run->id}",
            '/admin/fetch-logs',
            '/admin/audit-logs',
            '/admin/settings',
        ];
        foreach ($pages as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_article_list_shows_titles_and_slugs(): void
    {
        // Newest first; earn-or-not is on the first page.
        $this->get('/admin/articles')->assertSee('アフィリエイトは稼げない？そう言われる理由と、続けている人の共通点')->assertSee('earn-or-not');
    }

    public function test_articles_cannot_be_created_from_a_blank_form(): void
    {
        $this->get('/admin/articles/create')->assertNotFound();
    }
}
