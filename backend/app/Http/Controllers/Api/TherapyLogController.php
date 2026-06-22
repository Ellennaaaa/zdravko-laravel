<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\TherapyLogRequest;
use App\Models\Therapy;
use App\Models\TherapyLog;
use Illuminate\Http\Request;
use App\Services\EducationalAdviceService;

class TherapyLogController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can view therapy logs.', 403);
        }

        $logs = TherapyLog::with(['therapy', 'medicine', 'unit'])
            ->where('patient_id', $user->patient->id)
            ->latest('taken_at')
            ->get();

        return $this->respond([
            'therapy_logs' => $logs,
        ]);
    }

    public function store(TherapyLogRequest $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can create therapy logs.', 403);
        }

        $validated = $request->validated();

        if (! empty($validated['therapy_id'])) {
            $therapyExists = Therapy::where('id', $validated['therapy_id'])
                ->where('patient_id', $user->patient->id)
                ->exists();

            if (! $therapyExists) {
                return $this->respondWithError('Invalid therapy selected.', 403);
            }
        }

        $log = TherapyLog::create([
            ...$validated,
            'patient_id' => $user->patient->id,
        ])->load(['therapy', 'medicine', 'unit']);
        
        $advice = app(EducationalAdviceService::class)
             ->getAdviceForPatient($user->patient);

        return $this->respond([
            'message' => 'Therapy log created successfully.',
            'therapy_log' => $log,
            'advice' => $advice,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can delete therapy logs.', 403);
        }

        $log = TherapyLog::where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $log) {
            return $this->respondNotFound('Therapy log not found.');
        }

        $log->delete();

        return $this->respond([
            'message' => 'Therapy log deleted successfully.',
        ]);
    }
}