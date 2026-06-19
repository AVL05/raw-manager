<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'photographer_id', 'name', 'email', 'phone', 'address',
        'city', 'postal_code', 'nif', 'notes',
    ];

    public function photographer()
    {
        return $this->belongsTo(User::class, 'photographer_id');
    }

    public function photoSessions()
    {
        return $this->hasMany(PhotoSession::class);
    }

    public function favorites()
    {
        return $this->hasMany(GalleryImageFavorite::class);
    }
}