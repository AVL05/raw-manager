<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhotoLibrary extends Model
{
    protected $table = 'photo_library';

    protected $fillable = [
        'photographer_id', 'filename', 'path', 'thumbnail_path',
        'category', 'tags', 'size', 'mime_type', 'notes',
    ];

    protected $casts = [
        'tags' => 'array',
        'size' => 'integer',
    ];

    public function photographer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'photographer_id');
    }
}
