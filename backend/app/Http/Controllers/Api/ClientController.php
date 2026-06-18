<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Http\Resources\PhotoSessionResource;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Client::where('photographer_id', $request->user()->id)
            ->withCount('photoSessions');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('email', 'like', $search)
                  ->orWhere('phone', 'like', $search);
            });
        }

        $clients = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return ClientResource::collection($clients);
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = Client::create(array_merge(
            $request->validated(),
            ['photographer_id' => $request->user()->id]
        ));

        return response()->json(new ClientResource($client), 201);
    }

    public function show(Request $request, Client $client): JsonResponse
    {
        $this->authorizePhotographer($request, $client);

        return response()->json(new ClientResource($client->loadCount('photoSessions')));
    }

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $this->authorizePhotographer($request, $client);

        $client->update($request->validated());

        return response()->json(new ClientResource($client));
    }

    public function destroy(Request $request, Client $client): JsonResponse
    {
        $this->authorizePhotographer($request, $client);

        $client->delete();

        return response()->json(null, 204);
    }

    public function sessions(Request $request, Client $client): AnonymousResourceCollection
    {
        $this->authorizePhotographer($request, $client);

        $sessions = $client->photoSessions()
            ->with(['quote', 'invoice'])
            ->orderByDesc('date')
            ->paginate(10);

        return PhotoSessionResource::collection($sessions);
    }

    private function authorizePhotographer(Request $request, Client $client): void
    {
        abort_if($client->photographer_id !== $request->user()->id, 403, 'No autorizado.');
    }
}