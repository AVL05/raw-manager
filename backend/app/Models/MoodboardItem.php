<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MoodboardItem extends Model
{
    protected $fillable = ['moodboard_id', 'type', 'path', 'url', 'content', 'caption', 'order'];

    public function moodboard(): BelongsTo
    {
        return $this->belongsTo(Moodboard::class);
    }
}
