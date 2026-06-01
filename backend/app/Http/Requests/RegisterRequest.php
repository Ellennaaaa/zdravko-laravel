<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone_number' => ['required', 'string', 'max:50'],
            'role' => ['required', 'string', Rule::in(UserRole::publicValues())],
            'birth_date' => ['required_if:role,' . UserRole::PATIENT->value, 'date'],
            'diabetes_type_id' => [
                'required_if:role,' . UserRole::PATIENT->value,
                'exists:diabetes_types,id',
            ],
        ];
    }
}