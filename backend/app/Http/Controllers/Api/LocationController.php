<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\LocationPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::where('photographer_id', $request->user()->id)
            ->withCount('photos');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return response()->json(
            $query->orderBy('name')->paginate($request->per_page ?? 50)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'category'    => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'address'     => 'nullable|string|max:255',
        ]);

        $location = Location::create([...$data, 'photographer_id' => $request->user()->id]);

        return response()->json($location, 201);
    }

    public function show(Request $request, Location $location)
    {
        abort_if($location->photographer_id !== $request->user()->id, 403);

        return response()->json($location->load('photos'));
    }

    public function update(Request $request, Location $location)
    {
        abort_if($location->photographer_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'category'    => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'address'     => 'nullable|string|max:255',
        ]);

        $location->update($data);

        return response()->json($location);
    }

    public function destroy(Request $request, Location $location)
    {
        abort_if($location->photographer_id !== $request->user()->id, 403);

        foreach ($location->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        $location->delete();

        return response()->json(null, 204);
    }

    public function uploadPhoto(Request $request, Location $location)
    {
        abort_if($location->photographer_id !== $request->user()->id, 403);

        $request->validate(['photo' => 'required|image|max:8192']);

        $file = $request->file('photo');
        $path = $file->store("locations/{$location->id}", 'public');

        $photo = LocationPhoto::create([
            'location_id' => $location->id,
            'filename'    => $file->getClientOriginalName(),
            'path'        => $path,
            'order'       => $location->photos()->count(),
        ]);

        $photo->url = '/storage/' . $photo->path;

        return response()->json($photo, 201);
    }

    public function destroyPhoto(Request $request, Location $location, LocationPhoto $photo)
    {
        abort_if($location->photographer_id !== $request->user()->id, 403);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json(null, 204);
    }
}
