<?php

namespace App\Services;

use App\Models\Gallery;
use App\Models\GalleryImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class GalleryService
{
    public function uploadImages(Gallery $gallery, array $files): Collection
    {
        $images = collect();
        $order = $gallery->images()->max('order') ?? 0;

        foreach ($files as $file) {
            $filename = Str::uuid() . '.' . $file->extension();
            $folder = 'galleries/' . $gallery->id;

            $path = $file->storeAs($folder, $filename, 'public');

            $image = GalleryImage::create([
                'gallery_id' => $gallery->id,
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'order' => ++$order,
            ]);

            $images->push($image);
        }

        return $images;
    }

    public function deleteImage(GalleryImage $image): void
    {
        Storage::disk('public')->delete($image->path);
        if ($image->thumbnail_path) {
            Storage::disk('public')->delete($image->thumbnail_path);
        }
        $image->delete();
    }

    public function deleteGallery(Gallery $gallery): void
    {
        $gallery->images->each(fn($img) => $this->deleteImage($img));
        $gallery->delete();
    }
}