<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhotoLibrary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoLibraryController extends Controller
{
    public function index(Request $request)
    {
        $query = PhotoLibrary::where('photographer_id', $request->user()->id);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('tag')) {
            $query->whereJsonContains('tags', $request->tag);
        }
        if ($request->filled('search')) {
            $query->where('filename', 'like', "%{$request->search}%");
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate($request->per_page ?? 50)
        );
    }

    public function upload(Request $request)
    {
        $request->validate([
            'photos'    => 'required|array|min:1|max:20',
            'photos.*'  => 'required|image|max:15360',
            'category'  => 'nullable|string|max:100',
            'tags'      => 'nullable|array',
            'tags.*'    => 'string|max:50',
            'notes'     => 'nullable|string',
        ]);

        $created = [];
        foreach ($request->file('photos') as $file) {
            $path = $file->store('library/' . $request->user()->id, 'public');

            $photo = PhotoLibrary::create([
                'photographer_id' => $request->user()->id,
                'filename'        => $file->getClientOriginalName(),
                'path'            => $path,
                'category'        => $request->category,
                'tags'            => $request->tags ?? [],
                'size'            => $file->getSize(),
                'mime_type'       => $file->getMimeType(),
                'notes'           => $request->notes,
            ]);

            $photo->url = '/storage/' . $path;
            $created[]  = $photo;
        }

        return response()->json($created, 201);
    }

    public function show(Request $request, PhotoLibrary $photoLibrary)
    {
        abort_if($photoLibrary->photographer_id !== $request->user()->id, 403);

        $photoLibrary->url = '/storage/' . $photoLibrary->path;

        return response()->json($photoLibrary);
    }

    public function update(Request $request, PhotoLibrary $photoLibrary)
    {
        abort_if($photoLibrary->photographer_id !== $request->user()->id, 403);

        $data = $request->validate([
            'category' => 'nullable|string|max:100',
            'tags'     => 'nullable|array',
            'tags.*'   => 'string|max:50',
            'notes'    => 'nullable|string',
        ]);

        $photoLibrary->update($data);

        return response()->json($photoLibrary);
    }

    public function destroy(Request $request, PhotoLibrary $photoLibrary)
    {
        abort_if($photoLibrary->photographer_id !== $request->user()->id, 403);

        Storage::disk('public')->delete($photoLibrary->path);
        if ($photoLibrary->thumbnail_path) {
            Storage::disk('public')->delete($photoLibrary->thumbnail_path);
        }

        $photoLibrary->delete();

        return response()->json(null, 204);
    }
}
