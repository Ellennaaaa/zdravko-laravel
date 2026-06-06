<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SosAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        private User $patientUser
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'sos_alert',
            'title' => 'SOS UPOZORENJE',
            'message' => $this->patientUser->username . ' trazi hitnu pomoc',
            'patient_user_id' => $this->patientUser->id,
            'sound' => true,
        ];
    }
}