<?php

namespace App\Http\Requests\Session;

use App\Enums\SessionStatus;
use App\Enums\SessionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateSessionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'client_id' => 'sometimes|exists:clients,id',
            'name' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'time' => 'sometimes|nullable|date_format:H:i',
            'location' => 'sometimes|nullable|string|max:255',
            'type' => ['sometimes', new Enum(SessionType::class)],
            'status' => ['sometimes', new Enum(SessionStatus::class)],
            'price' => 'sometimes|nullable|numeric|min:0',
            'internal_notes' => 'sometimes|nullable|string',
        ];
    }
}