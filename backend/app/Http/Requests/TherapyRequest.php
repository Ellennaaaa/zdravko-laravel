<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TherapyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'medicine_id' => ['required', 'exists:medicines,id'],
                'dosage' => ['required', 'numeric'],
                'unit_id' => ['required', 'exists:units,id'],
                'times_per_day' => ['required', 'integer', 'min:1'],
                'start_time' => ['nullable', 'date_format:H:i'],
                'start_date' => ['required', 'date'],
                'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
                'note' => ['nullable', 'string'],
            ];
        }

        return [
            'medicine_id' => ['sometimes', 'required', 'exists:medicines,id'],
            'dosage' => ['sometimes', 'required', 'numeric'],
            'unit_id' => ['sometimes', 'required', 'exists:units,id'],
            'times_per_day' => ['sometimes', 'required', 'integer', 'min:1'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
        ];
    }
}