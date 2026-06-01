<?php

namespace App\Notifications;

use App\Models\Therapy;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TherapyReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Therapy $therapy
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'therapy_reminder',
            'title' => 'Therapy reminder',
            'message' => 'You should record your therapy intake.',
            'therapy_id' => $this->therapy->id,
            'medicine' => $this->therapy->medicine?->name,
            'sound' => true,
        ];
    }
}