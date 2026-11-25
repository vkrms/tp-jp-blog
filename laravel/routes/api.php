<?php

use App\Http\Controllers\Api\ExportController;
use App\Http\Middleware\EnsureExportToken;
use Illuminate\Support\Facades\Route;

// Build-time export for the Astro site (docs/spec.md §8.1): read-only, published content only.
Route::middleware(EnsureExportToken::class)->prefix('export')->controller(ExportController::class)->group(function () {
    Route::get('articles', 'articles');
    Route::get('categories', 'categories');
    Route::get('glossary', 'glossary');
    Route::get('meta', 'meta');
});
