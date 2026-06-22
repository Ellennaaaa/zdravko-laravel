<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BecomePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'birth_date' => ['required', 'date'],
            'diabetes_type_id' => ['required', 'exists:diabetes_types,id'],
        ];
    }
}