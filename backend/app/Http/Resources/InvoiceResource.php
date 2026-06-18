<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'photo_session_id' => $this->photo_session_id,
            'quote_id' => $this->quote_id,
            'status' => $this->status->value,
            'issue_date' => $this->issue_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'subtotal' => $this->subtotal,
            'tax_rate' => $this->tax_rate,
            'tax_amount' => $this->tax_amount,
            'total' => $this->total,
            'notes' => $this->notes,
            'pdf_url' => $this->pdf_path ? asset('storage/' . $this->pdf_path) : null,
            'session' => new PhotoSessionResource($this->whenLoaded('photoSession')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}