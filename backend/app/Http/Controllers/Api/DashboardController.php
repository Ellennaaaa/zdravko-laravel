<?php

namespace App\Http\Controllers\Api;

use App\Models\Measurement;
use App\Models\TherapyLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends ApiController
{
    private function getPatientId(Request $request)
    {
        $user = $request->user()->load('patient');

        if(! $user->patient){
            return null;
        }

        return $user->patient->id;
    }

    public function weeklyGlucose(Request $request)
    {
        $patientId = $this->getPatientId($request);

        if(! $patientId){
            return $this->respondWithError('Only patients can view glucose dashboard.', 403);
        }

        $startDate = Carbon::now()->subDays(6)->startOfDay();

        $measurements = Measurement::with('bloodGlucoseUnit')
            ->where('patient_id', $patientId)
            ->whereDate('measured_on', '>=', $startDate)
            ->orderBy('measured_on')
            ->get();

        return $this->respond([
            'period' => 'weekly',
            'data' => $measurements,
        ]);
    }

    public function monthlyGlucose(Request $request)
    {
        $patientId = $this->getPatientId($request);

        if (! $patientId) {
            return $this->respondWithError('Only patients can view glucose dashboard.', 403);
        }

        $startDate = Carbon::now()->subDays(29)->startOfDay();

        $measurements = Measurement::with('bloodGlucoseUnit')
            ->where('patient_id', $patientId)
            ->whereDate('measured_on', '>=', $startDate)
            ->orderBy('measured_on')
            ->get();

        return $this->respond([
            'period' => 'monthly',
            'data' => $measurements,
        ]);
    }

    public function weeklyTherapy(Request $request)
    {
        $patientId = $this->getPatientId($request);

        if (! $patientId) {
            return $this->respondWithError('Only patients can view therapy dashboard.', 403);
        }

        $startDate = Carbon::now()->subDays(6)->startOfDay();

        $logs = TherapyLog::with(['medicine', 'unit'])
            ->where('patient_id', $patientId)
            ->whereDate('taken_at', '>=', $startDate)
            ->orderBy('taken_at')
            ->get();

        return $this->respond([
            'period' => 'weekly',
            'data' => $logs,
        ]);
    }

    public function monthlyTherapy(Request $request)
    {
        $patientId = $this->getPatientId($request);

        if (! $patientId) {
            return $this->respondWithError('Only patients can view therapy dashboard.', 403);
        }

        $startDate = Carbon::now()->subDays(29)->startOfDay();

        $logs = TherapyLog::with(['medicine', 'unit'])
            ->where('patient_id', $patientId)
            ->whereDate('taken_at', '>=', $startDate)
            ->orderBy('taken_at')
            ->get();

        return $this->respond([
            'period' => 'monthly',
            'data' => $logs,
        ]);
    }
}
