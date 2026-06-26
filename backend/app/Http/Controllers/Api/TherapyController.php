<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\TherapyRequest;
use App\Models\Therapy;
use App\Services\AuditService;
use Illuminate\Http\Request;

class TherapyController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can view therapies.', 403);
        }

        $therapies = Therapy::with(['medicine', 'unit'])
            ->where('patient_id', $user->patient->id)
            ->latest()
            ->get();

        return $this->respond([
            'therapies' => $therapies,
        ]);
    }

    public function store(TherapyRequest $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can create therapies.', 403);
        }

        $therapy = Therapy::create([
            ...$request->validated(),
            'patient_id' => $user->patient->id,
        ])->load(['medicine', 'unit']);

        AuditService::log(
            action: 'therapy.created',
            model: 'Therapy',
            modelId: $therapy->id,
            payload: $request->validated()
        );

        return $this->respond([
            'message' => 'Therapy created successfully.',
            'therapy' => $therapy,
        ], 201);
    }

    public function update(TherapyRequest $request, $id)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can update therapies.', 403);
        }

        $therapy = Therapy::where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $therapy) {
            return $this->respondNotFound('Therapy not found.');
        }

        $therapy->update($request->validated());

        AuditService::log(
            action: 'therapy.updated',
            model: 'Therapy',
            modelId: $therapy->id,
            payload: $request->validated()
        );

        return $this->respond([
            'message' => 'Therapy updated successfully.',
            'therapy' => $therapy->load(['medicine', 'unit']),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can delete therapies.', 403);
        }

        $therapy = Therapy::where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $therapy) {
            return $this->respondNotFound('Therapy not found.');
        }

        AuditService::log(
            action: 'therapy.deleted',
            model: 'Therapy',
            modelId: $therapy->id
        );

        $therapy->delete();

        return $this->respond([
            'message' => 'Therapy deleted successfully.',
        ]);
    }
}
