<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PhotoSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'date' => $this->date?->format('Y-m-d'),
            'time' => $this->time,
            'location' => $this->location,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'price' => $this->price,
            'internal_notes' => $this->internal_notes,
            'client' => new ClientResource($this->whenLoaded('client')),
            'quote' => new QuoteResource($this->whenLoaded('quote')),
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'gallery' => new GalleryResource($this->whenLoaded('gallery')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}