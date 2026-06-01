<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MeasurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'value' => ['required', 'numeric'],
                'blood_glucose_unit_id' => ['required', 'exists:blood_glucose_units,id'],
                'measured_on' => ['nullable', 'date'],
            ];
        }

        return [
            'value' => ['sometimes', 'required', 'numeric'],
            'blood_glucose_unit_id' => ['sometimes', 'required', 'exists:blood_glucose_units,id'],
            'measured_on' => ['nullable', 'date'],
        ];
    }
}