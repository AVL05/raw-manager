<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocationPhoto extends Model
{
    protected $fillable = ['location_id', 'filename', 'path', 'order'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
