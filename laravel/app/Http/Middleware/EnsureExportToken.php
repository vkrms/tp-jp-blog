<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Static bearer token for the export API (docs/spec.md §8.1). The data is public once built;
 * the token only keeps arbitrary scrapers off the shared host. No token configured → closed.
 */
class EnsureExportToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('content.export_token');

        if (! $expected) {
            abort(503, 'Export API is not configured');
        }
        if (! is_string($request->bearerToken()) || ! hash_equals($expected, $request->bearerToken())) {
            abort(401);
        }

        return $next($request);
    }
}
