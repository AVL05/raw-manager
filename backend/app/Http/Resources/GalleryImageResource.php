<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'gallery_id' => $this->gallery_id,
            'filename' => $this->filename,
            'url' => '/storage/' . $this->path,
            'thumbnail_url' => '/storage/' . ($this->thumbnail_path ?? $this->path),
            'size' => $this->size,
            'mime_type' => $this->mime_type,
            'order' => $this->order,
            'is_favorite' => $this->when(isset($this->is_favorite), $this->is_favorite),
            'favorites_count' => $this->whenCounted('favorites'),
        ];
    }
}