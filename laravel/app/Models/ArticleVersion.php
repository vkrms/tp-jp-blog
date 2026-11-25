<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Immutable snapshot of an article's content (docs/spec.md §3.1). */
class ArticleVersion extends Model
{
    public const UPDATED_AT = null;
    public const AUTHORS = ['seed', 'writer', 'updater', 'admin'];

    protected $guarded = [];
    protected $casts = ['content' => 'array', 'source_ids' => 'array'];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
