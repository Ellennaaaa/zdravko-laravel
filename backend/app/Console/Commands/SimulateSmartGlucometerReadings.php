<?php

namespace App\Console\Commands;

use App\Constants\HealthConstants;
use App\Models\BloodGlucoseUnit;
use App\Models\EmergencyContact;
use App\Models\Measurement;
use App\Models\SmartGlucometer;
use App\Notifications\CriticalGlucoseAlertNotification;
use Illuminate\Console\Command;

class SimulateSmartGlucometerReadings extends Command
{
    protected $signature = 'zdravko:simulate-smart-glucometer-readings';

    protected $description = 'Simulate automatic Bluetooth smart glucometer readings.';

    public function handle(): int
    {
        $unit = BloodGlucoseUnit::where('symbol', 'mmol/L')->first();

        if (! $unit) {
            $this->error('Blood glucose unit mmol/L not found.');
            return self::FAILURE;
        }

        $glucometers = SmartGlucometer::where('is_active', true)
            ->with('patient')
            ->get();

        foreach ($glucometers as $glucometer) {
            if (! $glucometer->patient) {
                continue;
            }

            if (! $this->shouldSimulateNow($glucometer)) {
                continue;
            }

            $value = $this->generateSimulatedValue();

            $measurement = Measurement::create([
                'patient_id' => $glucometer->patient_id,
                'value' => $value,
                'blood_glucose_unit_id' => $unit->id,
                'measured_on' => now()->toDateString(),
            ])->load('bloodGlucoseUnit');

            $glucometer->update([
                'last_simulated_at' => now(),
            ]);

            $this->sendCriticalAlertIfNeeded($measurement);

            $this->info(
                'Inserted simulated glucose value ' .
                $value .
                ' mmol/L for patient ' .
                $glucometer->patient_id
            );
        }

        return self::SUCCESS;
    }

    private function shouldSimulateNow(SmartGlucometer $glucometer): bool
    {
        if (! $glucometer->last_simulated_at) {
            return true;
        }

        return $glucometer->last_simulated_at->diffInMinutes(now()) >= 5;
    }

    private function generateSimulatedValue(): float
    {
        $values = [
            4.8,
            5.2,
            5.9,
            6.3,
            7.1,
            8.4,
            9.2,
            10.5,
            12.0,
            14.2,
            3.4,
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