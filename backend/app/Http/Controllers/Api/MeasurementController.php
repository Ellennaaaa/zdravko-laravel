<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\MeasurementRequest;
use App\Models\Measurement;
use Illuminate\Http\Request;
use App\Constants\HealthConstants;
use App\Models\EmergencyContact;
use App\Notifications\CriticalGlucoseAlertNotification;
use App\Services\EducationalAdviceService;

class MeasurementController extends ApiController
{
    private function sendCriticalAlertIfNeeded(Measurement $measurement): void
    {
        $measurement->load(['bloodGlucoseUnit']);

        $value = (float) $measurement->value;
        $unit = $measurement->bloodGlucoseUnit?->symbol;

        $isCritical = false;

        if ($unit === 'mmol/L') {
            $isCritical =
                $value <= HealthConstants::CRITICAL_LOW_MMOL_L ||
                $value >= HealthConstants::CRITICAL_HIGH_MMOL_L;
        }

        if ($unit === 'mg/dL') {
            $isCritical =
                $value <= HealthConstants::CRITICAL_LOW_MG_DL ||
                $value >= HealthConstants::CRITICAL_HIGH_MG_DL;
        }

        if (! $isCritical) {
            return;
        }

        $contacts = EmergencyContact::with('contactUser')
            ->where('patient_id', $measurement->patient_id)
            ->where('is_active', true)
            ->get();

        foreach ($contacts as $contact) {
            if ($contact->contactUser) {
                $contact->contactUser->notify(
                    new CriticalGlucoseAlertNotification($measurement)
                );
                app(\App\Services\PushNotificationService::class)->sendToUser(
                $contact->contactUser,
                'Critical glucose alert',
                'Patient has a critical glucose value.',
                [
                    'type' => 'critical_glucose',
                    'measurement_id' => $measurement->id,
                ]
            );
            }
        }
    }
    public function index(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can view measurements.', 403);
        }

        $measurements = Measurement::with('bloodGlucoseUnit')
            ->where('patient_id', $user->patient->id)
            ->latest()
            ->get();

        return $this->respond([
            'measurements' => $measurements,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can view measurements.', 403);
        }

        $measurement = Measurement::with('bloodGlucoseUnit')
            ->where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $measurement) {
            return $this->respondNotFound('Measurement not found.');
        }

        return $this->respond([
            'measurement' => $measurement,
        ]);
    }

    public function store(MeasurementRequest $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can create measurements.', 403);
        }

        try {
            $validated = $request->validated();

            $measurement = Measurement::create([
                'patient_id' => $user->patient->id,
                'value' => $validated['value'],
                'blood_glucose_unit_id' => $validated['blood_glucose_unit_id'],
                'measured_on' => $validated['measured_on'] ?? null,
            ])->load(['patient', 'bloodGlucoseUnit']);

            $advice = app(EducationalAdviceService::class)
                 ->getAdviceForPatient($user->patient);

            $this->sendCriticalAlertIfNeeded($measurement);


           return $this->respond([
            'message' => 'Measurement created successfully.',
            'measurement' => $measurement,
            'advice' => $advice,
        ], 201); 
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(MeasurementRequest $request, $id)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can update measurements.', 403);
        }

        $measurement = Measurement::where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $measurement) {
            return $this->respondNotFound('Measurement not found.');
        }

        try {
            $measurement->update($request->validated());
            $measurement->load('bloodGlucoseUnit');

            return $this->respond([
                'message' => 'Measurement updated successfully.',
                'measurement' => $measurement,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can delete measurements.', 403);
        }

        $measurement = Measurement::where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $measurement) {
            return $this->respondNotFound('Measurement not found.');
        }

        try {
            $measurement->delete();

            return $this->respond([
                'message' => 'Measurement deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}