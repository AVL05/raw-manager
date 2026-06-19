<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Moodboard extends Model
{
    protected $fillable = ['photographer_id', 'name', 'folder', 'description'];

    public function photographer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'photographer_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MoodboardItem::class)->orderBy('order');
    }
}
