<?php

namespace App\Http\Controllers\Api;

use App\Models\EmergencyContact;
use App\Notifications\SosAlertNotification;
use App\Services\AuditService;
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
                app(\App\Services\PushNotificationService::class)->sendToUser(
                    $contact->contactUser,
                    'SOS alert',
                    $user->username . ' has sent an SOS alert.',
                    [
                        'type' => 'sos',
                        'patient_id' => $user->patient->id,
                    ]
                );
            }
        }

        AuditService::log(
            action: 'sos.sent',
            model: 'Patient',
            modelId: $user->patient->id,
            payload: ['contacts_notified' => $contacts->count()]
        );

        return $this->respond([
            'message' => 'SOS alert sent to emergency contacts.',
            'contacts_notified' => $contacts->count(),
        ]);
    }
}
