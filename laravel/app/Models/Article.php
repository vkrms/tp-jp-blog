<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    public const STATUSES = ['draft', 'pending_review', 'published', 'archived'];

    protected $guarded = [];
    protected $casts = [
        'level' => 'integer',
        'read_minutes' => 'integer',
        'published_at' => 'datetime',
        'content_updated_at' => 'date',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ArticleVersion::class)->orderBy('version');
    }

    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ArticleVersion::class, 'current_version_id');
    }

    public function updateLog(): HasMany
    {
        return $this->hasMany(ArticleUpdateLog::class)->orderBy('sort');
    }

    public function facts(): BelongsToMany
    {
        return $this->belongsToMany(Fact::class, 'fact_article', 'article_id', 'fact_id');
    }

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('status', 'published')->whereNotNull('current_version_id');
    }
}
