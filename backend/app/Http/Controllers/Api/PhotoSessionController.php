<?php

namespace App\Http\Controllers\Api;

use App\Enums\SessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Session\StoreSessionRequest;
use App\Http\Requests\Session\UpdateSessionRequest;
use App\Http\Resources\PhotoSessionResource;
use App\Models\PhotoSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class PhotoSessionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = PhotoSession::where('photographer_id', $request->user()->id)
            ->with(['client'])
            ->withCount(['quote', 'invoice', 'gallery']);

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('location', 'like', $search)
                  ->orWhereHas('client', fn($cq) => $cq->where('name', 'like', $search));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $sessions = $query->orderByDesc('date')->paginate($request->get('per_page', 15));

        return PhotoSessionResource::collection($sessions);
    }

    public function store(StoreSessionRequest $request): JsonResponse
    {
        $session = PhotoSession::create(array_merge(
            $request->validated(),
            ['photographer_id' => $request->user()->id]
        ));

        return response()->json(new PhotoSessionResource($session->load('client')), 201);
    }

    public function show(Request $request, PhotoSession $session): JsonResponse
    {
        $this->authorize($request, $session);

        return response()->json(new PhotoSessionResource(
            $session->load(['client', 'quote.items', 'invoice', 'gallery.images'])
        ));
    }

    public function update(UpdateSessionRequest $request, PhotoSession $session): JsonResponse
    {
        $this->authorize($request, $session);

        $session->update($request->validated());

        return response()->json(new PhotoSessionResource($session->load('client')));
    }

    public function destroy(Request $request, PhotoSession $session): JsonResponse
    {
        $this->authorize($request, $session);

        $session->delete();

        return response()->json(null, 204);
    }

    public function updateStatus(Request $request, PhotoSession $photoSession): JsonResponse
    {
        $this->authorize($request, $photoSession);

        $request->validate(['status' => ['required', new Enum(SessionStatus::class)]]);

        $photoSession->update(['status' => $request->status]);

        return response()->json(new PhotoSessionResource($photoSession->load('client')));
    }

    private function authorize(Request $request, PhotoSession $session): void
    {
        abort_if($session->photographer_id !== $request->user()->id, 403, 'No autorizado.');
    }
}