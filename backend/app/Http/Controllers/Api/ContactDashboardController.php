<?php

namespace App\Http\Controllers\Api;

use App\Models\EmergencyContact;
use App\Models\Measurement;
use App\Models\TherapyLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ContactDashboardController extends ApiController
{
    public function patients(Request $request)
    {
        $user = $request->user();

        $linkedPatients = EmergencyContact::with('patient.user')
            ->where('contact_user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(function ($contact) {
                return [
                    'patient_id' => $contact->patient->id,
                    'user_id' => $contact->patient->user->id,
                    'username' => $contact->patient->user->username,
                    'email' => $contact->patient->user->email,
                    'relationship' => $contact->relationship,
                ];
            });

        return $this->respond([
            'patients' => $linkedPatients,
        ]);
    }

    public function dashboard(Request $request, $patientId)
    {
        $user = $request->user();

        $isLinked = EmergencyContact::where('contact_user_id', $user->id)
            ->where('patient_id', $patientId)
            ->where('is_active', true)
            ->exists();

        if (! $isLinked) {
            return $this->respondWithError('You are not allowed to view this patient dashboard.', 403);
        }

        $startDate = Carbon::now()->subDays(6)->startOfDay();

        $measurements = Measurement::with('bloodGlucoseUnit')
            ->where('patient_id', $patientId)
            ->whereDate('measured_on', '>=', $startDate)
            ->orderBy('measured_on')
            ->get();

        $therapyLogs = TherapyLog::with(['medicine', 'unit'])
            ->where('patient_id', $patientId)
            ->whereDate('taken_at', '>=', $startDate)
            ->orderBy('taken_at')
            ->get();

        return $this->respond([
            'period' => 'weekly',
            'blood_glucose' => $measurements,
            'therapy_logs' => $therapyLogs,
        ]);
    }
}