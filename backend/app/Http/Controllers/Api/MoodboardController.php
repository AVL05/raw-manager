<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Moodboard;
use App\Models\MoodboardItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MoodboardController extends Controller
{
    public function index(Request $request)
    {
        $query = Moodboard::where('photographer_id', $request->user()->id)
            ->withCount('items');

        if ($request->filled('folder')) {
            $query->where('folder', $request->folder);
        }

        return response()->json(
            $query->orderBy('folder')->orderBy('name')->paginate($request->per_page ?? 50)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'folder'      => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $moodboard = Moodboard::create([...$data, 'photographer_id' => $request->user()->id]);

        return response()->json($moodboard, 201);
    }

    public function show(Request $request, Moodboard $moodboard)
    {
        abort_if($moodboard->photographer_id !== $request->user()->id, 403);

        return response()->json($moodboard->load('items'));
    }

    public function update(Request $request, Moodboard $moodboard)
    {
        abort_if($moodboard->photographer_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'folder'      => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $moodboard->update($data);

        return response()->json($moodboard);
    }

    public function destroy(Request $request, Moodboard $moodboard)
    {
        abort_if($moodboard->photographer_id !== $request->user()->id, 403);

        foreach ($moodboard->items as $item) {
            if ($item->path) {
                Storage::disk('public')->delete($item->path);
            }
        }

        $moodboard->delete();

        return response()->json(null, 204);
    }

    public function addItem(Request $request, Moodboard $moodboard)
    {
        abort_if($moodboard->photographer_id !== $request->user()->id, 403);

        $request->validate([
            'type'    => 'required|in:image,url,note',
            'image'   => 'required_if:type,image|image|max:8192',
            'url'     => 'required_if:type,url|nullable|url|max:2048',
            'content' => 'required_if:type,note|nullable|string',
            'caption' => 'nullable|string|max:255',
        ]);

        $data = [
            'moodboard_id' => $moodboard->id,
            'type'         => $request->type,
            'caption'      => $request->caption,
            'order'        => $moodboard->items()->count(),
        ];

        if ($request->type === 'image') {
            $path = $request->file('image')->store("moodboards/{$moodboard->id}", 'public');
            $data['path'] = $path;
        } elseif ($request->type === 'url') {
            $data['url'] = $request->url;
        } else {
            $data['content'] = $request->content;
        }

        $item = MoodboardItem::create($data);

        if ($item->path) {
            $item->image_url = '/storage/' . $item->path;
        }

        return response()->json($item, 201);
    }

    public function removeItem(Request $request, Moodboard $moodboard, MoodboardItem $item)
    {
        abort_if($moodboard->photographer_id !== $request->user()->id, 403);
        abort_if($item->moodboard_id !== $moodboard->id, 403);

        if ($item->path) {
            Storage::disk('public')->delete($item->path);
        }

        $item->delete();

        return response()->json(null, 204);
    }
}
