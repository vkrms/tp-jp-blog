<?php

namespace App\Content;

use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Triggers the Astro rebuild + deploy workflow via GitHub repository_dispatch (docs/spec.md §11.2).
 * Called once per publishing event; GitHub's `concurrency` group collapses bursts.
 * The outcome is kept in the `last_rebuild` setting so the admin can see a failed trigger and retry.
 */
class SiteRebuild
{
    public function trigger(string $reason): bool
    {
        $token = config('services.github.dispatch_token');
        $repo = config('services.github.repo');

        if (! $token || ! $repo) {
            $this->remember(false, $reason, 'not configured (GITHUB_REPO / GITHUB_DISPATCH_TOKEN)');
            Log::warning('Site rebuild skipped: GitHub dispatch is not configured', ['reason' => $reason]);

            return false;
        }

        try {
            Http::withToken($token)
                ->acceptJson()
                ->withHeaders(['X-GitHub-Api-Version' => '2022-11-28'])
                ->timeout(15)
                ->retry(3, 2000, throw: true) // 1 try + 2 retries (§11.2 step 3)
                ->post("https://api.github.com/repos/{$repo}/dispatches", [
                    'event_type' => config('services.github.event_type'),
                    'client_payload' => ['reason' => $reason],
                ]);
        } catch (Throwable $e) {
            $this->remember(false, $reason, $e->getMessage());
            Log::error('Site rebuild trigger failed', ['reason' => $reason, 'error' => $e->getMessage()]);

            return false;
        }

        $this->remember(true, $reason);

        return true;
    }

    private function remember(bool $ok, string $reason, ?string $error = null): void
    {
        Setting::put('last_rebuild', ['at' => now()->toIso8601String(), 'ok' => $ok, 'reason' => $reason, 'error' => $error]);
        AuditLog::record('rebuild', 'site', null, array_filter(['ok' => $ok, 'reason' => $reason, 'error' => $error], fn ($v) => $v !== null));
    }
}
