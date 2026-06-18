<?php

namespace App\Http\Requests\Invoice;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'quote_id' => 'required|exists:quotes,id',
            'due_date' => 'nullable|date|after_or_equal:today',
            'notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'quote_id.required' => 'El presupuesto es obligatorio.',
            'quote_id.exists' => 'El presupuesto no existe.',
        ];
    }
}