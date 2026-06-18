<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_id', 'photo_session_id', 'invoice_number', 'status',
        'issue_date', 'due_date', 'subtotal', 'tax_rate', 'tax_amount',
        'total', 'payment_date', 'notes', 'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvoiceStatus::class,
            'issue_date' => 'date',
            'due_date' => 'date',
            'payment_date' => 'date',
            'subtotal' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    public function photoSession()
    {
        return $this->belongsTo(PhotoSession::class);
    }
}