<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmergencyContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'contact_user_id' => ['required', 'exists:users,id'],
                'relationship' => ['required', 'string', 'max:100'],
                'is_active' => ['nullable', 'boolean'],
            ];
        }

        return [
            'contact_user_id' => ['sometimes', 'required', 'exists:users,id'],
            'relationship' => ['sometimes', 'required', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}