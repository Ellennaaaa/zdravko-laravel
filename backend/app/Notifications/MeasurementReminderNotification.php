<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MeasurementReminderNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'measurement_reminder',
            'title' => 'Podsjetnik za mjerenje glukoze',
            'message' => 'Nijeste mjerili nivo glukoze neko vrijeme',
            'sound' => true,
        ];
    }
}