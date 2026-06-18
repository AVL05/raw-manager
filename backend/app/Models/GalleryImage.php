<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'gallery_id', 'filename', 'path', 'thumbnail_path', 'size', 'mime_type', 'order',
    ];

    public function gallery()
    {
        return $this->belongsTo(Gallery::class);
    }

    public function favorites()
    {
        return $this->hasMany(GalleryImageFavorite::class);
    }
}