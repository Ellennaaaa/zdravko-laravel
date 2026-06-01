<?php

namespace App\Http\Controllers\Api;

use App\Models\EmergencyContact;
use App\Notifications\SosAlertNotification;
use Illuminate\Http\Request;

class SosController extends ApiController
{
    public function send(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can send SOS alerts.', 403);
        }

        $contacts = EmergencyContact::with('contactUser')
            ->where('patient_id', $user->patient->id)
            ->where('is_active', true)
            ->get();

        foreach ($contacts as $contact) {
            if ($contact->contactUser) {
                $contact->contactUser->notify(
                    new SosAlertNotification($user)
                );
            }
        }

        return $this->respond([
            'message' => 'SOS alert sent to emergency contacts.',
            'contacts_notified' => $contacts->count(),
        ]);
    }
}