<?php

namespace App\Http\Requests\Quote;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuoteRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'tax_rate' => 'sometimes|numeric|min:0|max:100',
            'valid_until' => 'sometimes|nullable|date',
            'notes' => 'sometimes|nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.id' => 'sometimes|exists:quote_items,id',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.quantity' => 'required_with:items|numeric|min:0.01',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ];
    }
}