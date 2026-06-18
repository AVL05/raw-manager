<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotographerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'business_name', 'nif', 'address', 'city',
        'postal_code', 'country', 'logo', 'bio', 'website', 'instagram',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}