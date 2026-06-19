<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipment::where('photographer_id', $request->user()->id);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('brand', 'like', "%{$request->search}%")
                  ->orWhere('model', 'like', "%{$request->search}%");
            });
        }

        return response()->json(
            $query->orderBy('type')->orderBy('name')->paginate($request->per_page ?? 50)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'brand'          => 'nullable|string|max:100',
            'model'          => 'nullable|string|max:100',
            'type'           => 'required|in:camera,lens,accessory,lighting,tripod,bag,other',
            'serial_number'  => 'nullable|string|max:100',
            'purchase_date'  => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'condition'      => 'nullable|in:excellent,good,fair,poor',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $equipment = Equipment::create([...$data, 'photographer_id' => $request->user()->id]);

        return response()->json($equipment, 201);
    }

    public function show(Request $request, Equipment $equipment)
    {
        abort_if($equipment->photographer_id !== $request->user()->id, 403);

        return response()->json($equipment);
    }

    public function update(Request $request, Equipment $equipment)
    {
        abort_if($equipment->photographer_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'brand'          => 'nullable|string|max:100',
            'model'          => 'nullable|string|max:100',
            'type'           => 'sometimes|in:camera,lens,accessory,lighting,tripod,bag,other',
            'serial_number'  => 'nullable|string|max:100',
            'purchase_date'  => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'condition'      => 'nullable|in:excellent,good,fair,poor',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $equipment->update($data);

        return response()->json($equipment);
    }

    public function destroy(Request $request, Equipment $equipment)
    {
        abort_if($equipment->photographer_id !== $request->user()->id, 403);
        $equipment->delete();

        return response()->json(null, 204);
    }
}
