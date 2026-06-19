<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Preset extends Model
{
    protected $fillable = [
        'photographer_id', 'name', 'category', 'iso', 'aperture',
        'shutter_speed', 'white_balance', 'exposure_compensation', 'notes',
    ];

    protected $casts = [
        'exposure_compensation' => 'integer',
    ];

    public function photographer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'photographer_id');
    }
}
