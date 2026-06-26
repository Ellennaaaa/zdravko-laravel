<?php

namespace App\Http\Controllers\Api;

use App\Models\EmergencyContact;
use App\Services\AuditService;
use Illuminate\Http\Request;

class EmergencyContactController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can view emergency contacts.', 403);
        }

        $contacts = EmergencyContact::with('contactUser')
            ->where('patient_id', $user->patient->id)
            ->latest()
            ->get();

        return $this->respond([
            'emergency_contacts' => $contacts,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can delete emergency contacts.', 403);
        }

        $contact = EmergencyContact::where('id', $id)
            ->where('patient_id', $user->patient->id)
            ->first();

        if (! $contact) {
            return $this->respondNotFound('Emergency contact not found.');
        }

        AuditService::log(
            action: 'emergency_contact.deleted',
            model: 'EmergencyContact',
            modelId: $contact->id,
            payload: ['contact_user_id' => $contact->contact_user_id]
        );

        $contact->delete();

        return $this->respond([
            'message' => 'Emergency contact deleted successfully.',
        ]);
    }
}
