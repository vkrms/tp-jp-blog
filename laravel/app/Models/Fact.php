<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Fact extends Model
{
    protected $primaryKey = 'fact_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = ['value' => 'array', 'checked_at' => 'datetime'];

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class);
    }

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'fact_article', 'fact_id', 'article_id');
    }
}
