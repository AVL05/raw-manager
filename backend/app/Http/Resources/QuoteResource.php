<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'photo_session_id' => $this->photo_session_id,
            'status' => $this->status->value,
            'subtotal' => $this->subtotal,
            'tax_rate' => $this->tax_rate,
            'tax_amount' => $this->tax_amount,
            'total' => $this->total,
            'valid_until' => $this->valid_until?->format('Y-m-d'),
            'notes' => $this->notes,
            'pdf_url' => $this->pdf_path ? asset('storage/' . $this->pdf_path) : null,
            'items' => QuoteItemResource::collection($this->whenLoaded('items')),
            'session' => new PhotoSessionResource($this->whenLoaded('photoSession')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}