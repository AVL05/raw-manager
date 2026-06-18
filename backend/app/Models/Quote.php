<?php

namespace App\Models;

use App\Enums\QuoteStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'photo_session_id', 'status', 'subtotal', 'tax_rate',
        'tax_amount', 'total', 'valid_until', 'notes', 'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'status' => QuoteStatus::class,
            'subtotal' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'valid_until' => 'date',
        ];
    }

    public function photoSession()
    {
        return $this->belongsTo(PhotoSession::class);
    }

    public function items()
    {
        return $this->hasMany(QuoteItem::class)->orderBy('order');
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function recalculate(): void
    {
        $subtotal = $this->items->sum('subtotal');
        $taxAmount = round($subtotal * ($this->tax_rate / 100), 2);
        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $subtotal + $taxAmount,
        ]);
    }
}