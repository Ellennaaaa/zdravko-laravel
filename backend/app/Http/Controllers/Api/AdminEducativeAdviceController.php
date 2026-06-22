<?php

namespace App\Http\Controllers\Api;

use App\Models\EducationalAdvice;
use Illuminate\Http\Request;

class AdminEducativeAdviceController extends ApiController
{
    public function index()
    {
        return $this->respond([
            'advices' => EducationalAdvice::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'diabetes_type_id' => ['nullable', 'exists:diabetes_types,id'],
            'min_age' => ['nullable', 'integer', 'min:0'],
            'max_age' => ['nullable', 'integer', 'min:0'],
            'title' => ['required', 'string', 'max:150'],
            'content' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $advice = EducationalAdvice::create([
            ...$validated,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return $this->respond([
            'message' => 'Educative advice created successfully.',
            'advice' => $advice,
        ], 201);
    }

    public function destroy($id)
    {
        $advice = EducationalAdvice::find($id);

        if (! $advice) {
            return $this->respondNotFound('Advice not found.');
        }

        $advice->delete();

        return $this->respond([
            'message' => 'Advice deleted successfully.',
        ]);
    }
}