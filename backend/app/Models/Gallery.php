<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'photo_session_id', 'name', 'description', 'access_token', 'is_active', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Gallery $gallery) {
            if (empty($gallery->access_token)) {
                $gallery->access_token = Str::uuid()->toString();
            }
        });
    }

    public function photoSession()
    {
        return $this->belongsTo(PhotoSession::class);
    }

    public function images()
    {
        return $this->hasMany(GalleryImage::class)->orderBy('order');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isAccessible(): bool
    {
        return $this->is_active && !$this->isExpired();
    }
}