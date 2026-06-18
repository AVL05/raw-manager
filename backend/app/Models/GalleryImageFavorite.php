<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryImageFavorite extends Model
{
    use HasFactory;

    protected $fillable = ['gallery_image_id', 'client_id'];

    public function galleryImage()
    {
        return $this->belongsTo(GalleryImage::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}