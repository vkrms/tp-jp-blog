<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Content schema, docs/spec.md §3.1.
 *
 * Bilingual texts are JSON. Article content is stored verbatim in the stage-1 format
 * (texts as [ja, en] or {ja, en}, sections[].b[] single-key blocks) so the Astro
 * components render it unchanged; normalisation is a separate step (docs/next-steps.md).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $t) {
            $t->string('id', 32)->primary();
            $t->json('title');                 // {ja, en}
            $t->string('color', 16);
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('sources', function (Blueprint $t) {
            $t->string('id', 64)->primary();
            $t->json('name');                  // {ja, en}
            $t->string('url', 1024);
            $t->date('published_at')->nullable();
            $t->string('type', 16);            // gov | assoc | research | asp | news | seo | internal
            $t->unsignedTinyInteger('tier')->default(1);
            $t->string('refresh', 16)->nullable(); // week | month | quarter | year | event
            $t->boolean('fetch_allowed')->default(true);
            $t->timestamp('last_checked_at')->nullable();
            $t->string('last_status', 32)->nullable();
            $t->timestamps();
        });

        Schema::create('facts', function (Blueprint $t) {
            $t->string('fact_id', 128)->primary();
            $t->json('value')->nullable();      // {ja, en} text fragment for {{fact:…}}; null until prepared (§3.2)
            $t->text('internal_note')->nullable();
            $t->string('source_id', 64)->nullable();
            $t->string('source_url', 1024)->nullable();
            $t->string('source_date', 10)->nullable(); // YYYY-MM-DD or YYYY-MM
            $t->string('refresh', 16);
            $t->timestamp('checked_at')->nullable();
            $t->timestamps();
            $t->foreign('source_id')->references('id')->on('sources')->nullOnDelete();
        });

        Schema::create('articles', function (Blueprint $t) {
            $t->id();
            $t->string('slug', 128)->unique();
            $t->string('category_id', 32);
            $t->unsignedTinyInteger('level')->default(0);
            $t->unsignedSmallInteger('read_minutes');
            $t->string('keyword')->nullable();
            $t->string('icon', 32)->nullable();
            $t->string('status', 16)->default('draft')->index(); // draft | pending_review | published | archived
            $t->unsignedBigInteger('current_version_id')->nullable();
            $t->timestamp('published_at')->nullable();
            $t->date('content_updated_at');     // public "updated" date (dateModified), not the row timestamp
            $t->timestamps();
            $t->foreign('category_id')->references('id')->on('categories');
        });

        Schema::create('article_versions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('article_id')->constrained()->cascadeOnDelete();
            $t->unsignedInteger('version');
            $t->json('content');               // title, eyebrow, answer_first, sections, faq, matome, related
            $t->json('source_ids');
            $t->string('author', 16);          // seed | writer | updater | admin
            $t->unsignedBigInteger('run_id')->nullable();
            $t->text('change_summary')->nullable();
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['article_id', 'version']);
        });

        Schema::table('articles', function (Blueprint $t) {
            $t->foreign('current_version_id')->references('id')->on('article_versions')->nullOnDelete();
        });

        Schema::create('article_update_log', function (Blueprint $t) {
            $t->id();
            $t->foreignId('article_id')->constrained()->cascadeOnDelete();
            $t->date('date');
            $t->json('public');                // shown on the site
            $t->json('internal_note')->nullable(); // never exported
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('fact_article', function (Blueprint $t) {
            $t->string('fact_id', 128);
            $t->foreignId('article_id')->constrained()->cascadeOnDelete();
            $t->primary(['fact_id', 'article_id']);
            $t->foreign('fact_id')->references('fact_id')->on('facts')->cascadeOnDelete();
        });

        Schema::create('topic_queue', function (Blueprint $t) {
            $t->id();
            $t->string('keyword');
            $t->string('topic');
            $t->unsignedInteger('monthly_volume')->nullable();
            $t->string('status', 16)->default('idea'); // idea | ready | held | used
            $t->text('reason')->nullable();
            $t->foreignId('article_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('glossary_terms', function (Blueprint $t) {
            $t->id();
            $t->json('term');                  // {ja, en}
            $t->json('definition');            // {ja, en}
            $t->string('kind', 8);             // gen | tp
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('agent_runs', function (Blueprint $t) {
            $t->id();
            $t->string('agent', 16);           // writer | updater | editor
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // editor: who called
            $t->string('action', 32)->nullable(); // editor: rewrite | translate | suggest_faq | regenerate | …
            $t->timestamp('started_at');
            $t->timestamp('finished_at')->nullable();
            $t->string('status', 16)->nullable(); // ok | partial | failed | blocked_paused | needs_human
            $t->string('input_hash', 64)->nullable();
            $t->string('model', 128)->nullable();
            $t->unsignedInteger('tokens_in')->nullable();
            $t->unsignedInteger('tokens_out')->nullable();
            $t->decimal('cost_usd', 10, 6)->nullable();
            $t->json('report')->nullable();
            $t->text('error')->nullable();
            $t->timestamps();
            $t->index(['agent', 'started_at']);
        });

        Schema::create('fetch_log', function (Blueprint $t) {
            $t->id();
            $t->string('url', 1024);
            $t->timestamp('fetched_at');
            $t->unsignedSmallInteger('http_status')->nullable();
            $t->string('content_hash', 64)->nullable();
            $t->text('text_excerpt')->nullable();
            $t->boolean('injection_suspected')->default(false);
            $t->foreignId('run_id')->nullable()->constrained('agent_runs')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('settings', function (Blueprint $t) {
            $t->string('key', 64)->primary();
            $t->json('value')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('articles', fn (Blueprint $t) => $t->dropForeign(['current_version_id']));
        foreach (['settings', 'fetch_log', 'agent_runs', 'glossary_terms', 'topic_queue', 'fact_article',
            'article_update_log', 'article_versions', 'articles', 'facts', 'sources', 'categories'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
