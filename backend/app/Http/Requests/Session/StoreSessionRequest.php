<?php

namespace App\Http\Requests\Session;

use App\Enums\SessionStatus;
use App\Enums\SessionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSessionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'type' => ['required', new Enum(SessionType::class)],
            'status' => ['sometimes', new Enum(SessionStatus::class)],
            'price' => 'nullable|numeric|min:0',
            'internal_notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => 'Debes seleccionar un cliente.',
            'client_id.exists' => 'El cliente no existe.',
            'name.required' => 'El nombre de la sesión es obligatorio.',
            'date.required' => 'La fecha es obligatoria.',
            'type.required' => 'El tipo de sesión es obligatorio.',
        ];
    }
}