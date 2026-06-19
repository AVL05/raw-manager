<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Preset;
use Illuminate\Http\Request;

class PresetController extends Controller
{
    public function index(Request $request)
    {
        $query = Preset::with('equipment:id,name,brand,model')
            ->where('photographer_id', $request->user()->id);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('equipment_id')) {
            $query->where('equipment_id', $request->equipment_id);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return response()->json(
            $query->orderBy('category')->orderBy('name')->paginate($request->per_page ?? 50)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'equipment_id'          => 'nullable|exists:equipment,id',
            'category'              => 'nullable|string|max:100',
            'iso'                   => 'nullable|string|max:20',
            'aperture'              => 'nullable|string|max:20',
            'shutter_speed'         => 'nullable|string|max:20',
            'white_balance'         => 'nullable|string|max:50',
            'exposure_compensation' => 'nullable|integer|between:-5,5',
            'notes'                 => 'nullable|string',
        ]);

        $preset = Preset::create([...$data, 'photographer_id' => $request->user()->id]);

        return response()->json($preset->load('equipment:id,name,brand,model'), 201);
    }

    public function show(Request $request, Preset $preset)
    {
        abort_if($preset->photographer_id !== $request->user()->id, 403);

        return response()->json($preset->load('equipment:id,name,brand,model'));
    }

    public function update(Request $request, Preset $preset)
    {
        abort_if($preset->photographer_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name'                  => 'sometimes|string|max:255',
            'equipment_id'          => 'nullable|exists:equipment,id',
            'category'              => 'nullable|string|max:100',
            'iso'                   => 'nullable|string|max:20',
            'aperture'              => 'nullable|string|max:20',
            'shutter_speed'         => 'nullable|string|max:20',
            'white_balance'         => 'nullable|string|max:50',
            'exposure_compensation' => 'nullable|integer|between:-5,5',
            'notes'                 => 'nullable|string',
        ]);

        $preset->update($data);

        return response()->json($preset->load('equipment:id,name,brand,model'));
    }

    public function destroy(Request $request, Preset $preset)
    {
        abort_if($preset->photographer_id !== $request->user()->id, 403);
        $preset->delete();

        return response()->json(null, 204);
    }
}
