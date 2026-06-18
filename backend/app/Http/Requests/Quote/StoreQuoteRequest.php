<?php

namespace App\Http\Requests\Quote;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'photo_session_id' => 'required|exists:photo_sessions,id',
            'tax_rate' => 'sometimes|numeric|min:0|max:100',
            'valid_until' => 'nullable|date|after:today',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'El presupuesto debe tener al menos un concepto.',
            'items.*.description.required' => 'La descripción de cada concepto es obligatoria.',
            'items.*.quantity.required' => 'La cantidad es obligatoria.',
            'items.*.unit_price.required' => 'El precio unitario es obligatorio.',
        ];
    }
}