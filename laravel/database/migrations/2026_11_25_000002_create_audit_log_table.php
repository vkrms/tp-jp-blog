<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Admin actions on content (publish, rollback, archive, edits, rebuilds) — docs/spec.md §12 phase 3. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_log', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('action', 32);               // publish | rollback | archive | edit | rebuild | settings
            $t->string('subject_type', 32)->nullable(); // article | fact | settings | site
            $t->string('subject_id', 128)->nullable();
            $t->json('details')->nullable();
            $t->timestamp('created_at')->useCurrent();
            $t->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};
