<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgentRun extends Model
{
    protected $guarded = [];
    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'cost_usd' => 'decimal:6',
        'report' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fetches(): HasMany
    {
        return $this->hasMany(FetchLog::class, 'run_id');
    }
}
