<?php

namespace App\Http\Controllers\Api;

use App\Constants\HealthConstants;
use App\Models\BloodGlucoseUnit;
use App\Models\EmergencyContact;
use App\Models\Measurement;
use App\Notifications\CriticalGlucoseAlertNotification;
use Illuminate\Http\Request;

class BluetoothGlucoseController extends ApiController
{
    public function simulate(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can simulate glucose measurement.', 403);
        }

        $unit = BloodGlucoseUnit::where('symbol', 'mmol/L')->first();

        if (! $unit) {
            return $this->respondWithError('Blood glucose unit mmol/L not found.', 404);
        }

        $value = $this->generateSimulatedValue();

        $measurement = Measurement::create([
            'patient_id' => $user->patient->id,
            'value' => $value,
            'blood_glucose_unit_id' => $unit->id,
            'measured_on' => now()->toDateString(),
        ])->load(['patient', 'bloodGlucoseUnit']);

        $this->sendCriticalAlertIfNeeded($measurement);

        return $this->respond([
            'message' => 'Bluetooth glucose measurement simulated successfully.',
            'measurement' => $measurement,
        ], 201);
    }

    private function generateSimulatedValue(): float
    {
        $values = [
            4.8, 5.2, 5.9, 6.3, 7.1,
            8.4, 9.2, 10.5, 12.0,
            14.2, 3.4,
        ];

        return $values[array_rand($values)];
    }

    private function sendCriticalAlertIfNeeded(Measurement $measurement): void
    {
        $measurement->load('bloodGlucoseUnit');

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
            }
        }
    }
}