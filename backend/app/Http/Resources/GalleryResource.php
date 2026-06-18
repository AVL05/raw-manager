<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'photo_session_id' => $this->photo_session_id,
            'name' => $this->name,
            'description' => $this->description,
            'access_token' => $this->access_token,
            'public_url' => url('/gallery/' . $this->access_token),
            'is_active' => $this->is_active,
            'expires_at' => $this->expires_at,
            'is_accessible' => $this->isAccessible(),
            'images_count' => $this->whenCounted('images'),
            'images' => GalleryImageResource::collection($this->whenLoaded('images')),
            'session' => new PhotoSessionResource($this->whenLoaded('photoSession')),
            'created_at' => $this->created_at,
        ];
    }
}