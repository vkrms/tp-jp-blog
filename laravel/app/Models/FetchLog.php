<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FetchLog extends Model
{
    protected $table = 'fetch_log';
    protected $guarded = [];
    protected $casts = ['fetched_at' => 'datetime', 'injection_suspected' => 'boolean'];

    public function run(): BelongsTo
    {
        return $this->belongsTo(AgentRun::class, 'run_id');
    }
}
