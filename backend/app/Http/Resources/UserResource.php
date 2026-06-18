<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'phone' => $this->phone,
            'avatar' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'profile' => $this->whenLoaded('photographerProfile', fn() => [
                'business_name' => $this->photographerProfile->business_name,
                'nif' => $this->photographerProfile->nif,
                'address' => $this->photographerProfile->address,
                'city' => $this->photographerProfile->city,
                'postal_code' => $this->photographerProfile->postal_code,
                'country' => $this->photographerProfile->country,
                'logo' => $this->photographerProfile->logo ? asset('storage/' . $this->photographerProfile->logo) : null,
                'bio' => $this->photographerProfile->bio,
                'website' => $this->photographerProfile->website,
                'instagram' => $this->photographerProfile->instagram,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}