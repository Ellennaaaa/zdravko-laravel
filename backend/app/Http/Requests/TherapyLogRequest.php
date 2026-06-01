<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TherapyLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'therapy_id' => ['nullable', 'exists:therapies,id'],
            'medicine_id' => ['required', 'exists:medicines,id'],
            'dosage' => ['required', 'numeric'],
            'unit_id' => ['required', 'exists:units,id'],
            'taken_at' => ['required', 'date'],
            'note' => ['nullable', 'string'],
        ];
    }
}