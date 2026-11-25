<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = [
        'name' => 'array',
        'published_at' => 'date',
        'fetch_allowed' => 'boolean',
        'last_checked_at' => 'datetime',
    ];
}
