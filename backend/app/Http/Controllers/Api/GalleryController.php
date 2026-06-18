<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Gallery\StoreGalleryRequest;
use App\Http\Requests\Gallery\UpdateGalleryRequest;
use App\Http\Resources\GalleryResource;
use App\Http\Resources\GalleryImageResource;
use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Models\PhotoSession;
use App\Services\GalleryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GalleryController extends Controller
{
    public function __construct(private GalleryService $galleryService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $galleries = Gallery::whereHas('photoSession', fn($q) => $q->where('photographer_id', $request->user()->id))
            ->with('photoSession.client')
            ->withCount('images')
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return GalleryResource::collection($galleries);
    }

    public function store(StoreGalleryRequest $request): JsonResponse
    {
        $session = PhotoSession::findOrFail($request->photo_session_id);
        abort_if($session->photographer_id !== $request->user()->id, 403);

        $gallery = Gallery::create($request->validated());

        return response()->json(new GalleryResource($gallery->load('photoSession.client')), 201);
    }

    public function show(Request $request, Gallery $gallery): JsonResponse
    {
        $this->authorize($request, $gallery);

        return response()->json(new GalleryResource($gallery->load(['images', 'photoSession.client'])->loadCount('images')));
    }

    public function update(UpdateGalleryRequest $request, Gallery $gallery): JsonResponse
    {
        $this->authorize($request, $gallery);

        $gallery->update($request->validated());

        return response()->json(new GalleryResource($gallery));
    }

    public function destroy(Request $request, Gallery $gallery): JsonResponse
    {
        $this->authorize($request, $gallery);

        $this->galleryService->deleteGallery($gallery);

        return response()->json(null, 204);
    }

    public function uploadImages(Request $request, Gallery $gallery): JsonResponse
    {
        $this->authorize($request, $gallery);

        $request->validate([
            'images' => 'required|array|max:50',
            'images.*' => 'required|image|mimes:jpeg,png,webp|max:' . config('app.max_image_size', 10240),
        ]);

        $images = $this->galleryService->uploadImages($gallery, $request->file('images'));

        return response()->json(GalleryImageResource::collection($images), 201);
    }

    public function destroyImage(Request $request, Gallery $gallery, GalleryImage $image): JsonResponse
    {
        $this->authorize($request, $gallery);
        abort_if($image->gallery_id !== $gallery->id, 404);

        $this->galleryService->deleteImage($image);

        return response()->json(null, 204);
    }

    private function authorize(Request $request, Gallery $gallery): void
    {
        abort_if($gallery->photoSession->photographer_id !== $request->user()->id, 403, 'No autorizado.');
    }
}