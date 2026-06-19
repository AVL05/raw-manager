<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Http\Resources\GalleryResource;
use App\Models\Client;
use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Models\GalleryImageFavorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicGalleryController extends Controller
{
    public function show(Request $request, string $token): JsonResponse
    {
        $gallery = Gallery::where('access_token', $token)
            ->with(['images', 'photoSession'])
            ->firstOrFail();

        if (!$gallery->isAccessible()) {
            return response()->json(['message' => 'Esta galería no está disponible.'], 403);
        }

        // Si se pasa client_email, marcamos is_favorite en cada imagen
        if ($request->filled('client_email')) {
            $client = Client::where('email', $request->client_email)
                ->whereHas('photoSessions', fn($q) => $q->where('id', $gallery->photo_session_id))
                ->first();

            if ($client) {
                $favoriteIds = GalleryImageFavorite::where('client_id', $client->id)
                    ->whereIn('gallery_image_id', $gallery->images->pluck('id'))
                    ->pluck('gallery_image_id')
                    ->flip();

                $gallery->images->each(function ($img) use ($favoriteIds) {
                    $img->is_favorite = isset($favoriteIds[$img->id]);
                });
            }
        }

        return response()->json(new GalleryResource($gallery));
    }

    public function toggleFavorite(Request $request, string $token, GalleryImage $image): JsonResponse
    {
        $gallery = Gallery::where('access_token', $token)->firstOrFail();

        if (!$gallery->isAccessible() || $image->gallery_id !== $gallery->id) {
            abort(403);
        }

        $request->validate(['client_email' => 'required|email']);

        $client = Client::where('email', $request->client_email)
            ->whereHas('photoSessions', fn($q) => $q->where('id', $gallery->photo_session_id))
            ->first();

        if (!$client) {
            return response()->json(['message' => 'Cliente no encontrado para esta sesión.'], 404);
        }

        $existing = GalleryImageFavorite::where('gallery_image_id', $image->id)
            ->where('client_id', $client->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $favorited = false;
        } else {
            GalleryImageFavorite::create([
                'gallery_image_id' => $image->id,
                'client_id' => $client->id,
            ]);
            $favorited = true;
        }

        return response()->json(['favorited' => $favorited]);
    }
}