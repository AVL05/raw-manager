<?php

namespace App\Models;

use App\Enums\SessionStatus;
use App\Enums\SessionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotoSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'photographer_id', 'client_id', 'name', 'date', 'time',
        'location', 'type', 'status', 'price', 'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'type' => SessionType::class,
            'status' => SessionStatus::class,
            'price' => 'decimal:2',
        ];
    }

    public function photographer()
    {
        return $this->belongsTo(User::class, 'photographer_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function quote()
    {
        return $this->hasOne(Quote::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function gallery()
    {
        return $this->hasOne(Gallery::class);
    }
}