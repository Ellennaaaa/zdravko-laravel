<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\SmartGlucometerRequest;
use App\Models\SmartGlucometer;
use Illuminate\Http\Request;

class SmartGlucometerController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can view glucometers.', 403);
        }

        return $this->respond([
            'smart_glucometers' => SmartGlucometer::where('patient_id', $user->patient->id)
                ->latest()
                ->get(),
        ]);
    }

    public function store(SmartGlucometerRequest $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can add glucometers.', 403);
        }

        $glucometer = SmartGlucometer::create([
            ...$request->validated(),
            'patient_id' => $user->patient->id,
            'is_active' => $request->validated()['is_active'] ?? true,
        ]);

        return $this->respond([
            'message' => 'Smart glucometer added successfully.',
            'smart_glucometer' => $glucometer,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->load('patient');

        $glucometer = SmartGlucometer::where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $glucometer) {
            return $this->respondNotFound('Smart glucometer not found.');
        }

        $glucometer->delete();

        return $this->respond([
            'message' => 'Smart glucometer deleted successfully.',
        ]);
    }
}