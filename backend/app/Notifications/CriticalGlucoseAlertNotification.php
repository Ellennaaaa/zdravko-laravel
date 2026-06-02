<?php

namespace App\Notifications;

use App\Models\Measurement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CriticalGlucoseAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Measurement $measurement
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'critical_glucose_alert',
            'title' => 'Critical blood glucose alert',
            'message' => 'Primijecena kriticna vrijednost secera u krvi',
            'measurement_id' => $this->measurement->id,
            'value' => $this->measurement->value,
            'unit' => $this->measurement->bloodGlucoseUnit?->symbol,
            'sound' => true,
        ];
    }
}