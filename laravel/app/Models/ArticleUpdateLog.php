<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleUpdateLog extends Model
{
    protected $table = 'article_update_log';
    protected $guarded = [];
    protected $casts = ['date' => 'date', 'public' => 'array', 'internal_note' => 'array'];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
