<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\BecomePatientRequest;
use App\Models\Role;
use App\Services\AuditService;

class RoleUpgradeController extends ApiController
{
    public function becomePatient(BecomePatientRequest $request)
    {
        $user = $request->user()->load(['roles', 'patient']);

        if ($user->patient) {
            return $this->respond([
                'message' => 'User is already a patient.',
                'user' => $user,
            ]);
        }

        $validated = $request->validated();

        $patientRole = Role::where('name', 'patient')->firstOrFail();

        if (! $user->roles()->where('name', 'patient')->exists()) {
            $user->roles()->attach($patientRole->id);
        }

        $user->patient()->create([
            'birth_date' => $validated['birth_date'],
            'diabetes_type_id' => $validated['diabetes_type_id'],
        ]);

        AuditService::log(
            action: 'user.became_patient',
            model: 'User',
            modelId: $user->id,
            payload: ['diabetes_type_id' => $validated['diabetes_type_id']]
        );

        return $this->respond([
            'message' => 'You are now registered as a patient.',
            'user' => $user->load(['roles', 'patient']),
        ], 201);
    }
}
