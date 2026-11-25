<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TopicQueueItem extends Model
{
    public const STATUSES = ['idea', 'ready', 'held', 'used'];

    protected $table = 'topic_queue';
    protected $guarded = [];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
