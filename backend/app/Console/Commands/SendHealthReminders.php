<?php

namespace App\Console\Commands;

use App\Constants\HealthConstants;
use App\Models\Patient;
use App\Models\Therapy;
use App\Models\TherapyLog;
use App\Notifications\MeasurementReminderNotification;
use App\Notifications\TherapyReminderNotification;
use Illuminate\Console\Command;

class SendHealthReminders extends Command
{
    protected $signature = 'zdravko:send-health-reminders';

    protected $description = 'Send measurement and therapy reminders.';

    public function handle(): int
    {
        $this->sendMeasurementReminders();
        $this->sendTherapyReminders();

        $this->info('Health reminders checked.');

        return self::SUCCESS;
    }

    private function sendMeasurementReminders(): void
    {
        $patients = Patient::with(['user', 'measurements'])->get();

        foreach ($patients as $patient) {
            if (! $patient->user) {
                continue;
            }

            $lastMeasurement = $patient->measurements()
                ->latest('created_at')
                ->first();

            if (! $lastMeasurement) {
                if (! $this->hasUnreadMeasurementReminder($patient->user)) {
                    $patient->user->notify(new MeasurementReminderNotification());
                    app(\App\Services\PushNotificationService::class)->sendToUser(
                        $patient->user,
                        'Blood glucose reminder',
                        'You have not measured your blood glucose recently.',
                        [
                            'type' => 'measurement_reminder',
                        ]
                    );
                }
                continue;
            }

            $hoursPassed = $lastMeasurement
                ? $lastMeasurement->created_at->diffInHours(now())
                : HealthConstants::MEASUREMENT_REMINDER_HOURS + 1;

            if ($hoursPassed >= HealthConstants::MEASUREMENT_REMINDER_HOURS) {
                if (! $this->hasUnreadMeasurementReminder($patient->user)) {
                    $patient->user->notify(new MeasurementReminderNotification());

                    app(\App\Services\PushNotificationService::class)->sendToUser(
                        $patient->user,
                        'Blood glucose reminder',
                        'You have not measured your blood glucose recently.',
                        [
                            'type' => 'measurement_reminder',
                        ]
                    );
                }

                $this->info(
                    'Patient ' . $patient->id .
                    ' user ' . $patient->user->id .
                    ' last measurement created at ' . $lastMeasurement->created_at .
                    ' hours passed: ' . $hoursPassed
                );
            }

            
        }
        }

    private function hasUnreadMeasurementReminder($user): bool
    {
        return $user->unreadNotifications()
            ->where('type', MeasurementReminderNotification::class)
            ->exists();
    }

    private function sendTherapyReminders(): void
    {
        $therapies = Therapy::with(['patient.user', 'medicine'])
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now());
            })
            ->get();

        foreach ($therapies as $therapy) {
            $user = $therapy->patient?->user;

            if (! $user) {
                continue;
            }

            $hoursBetweenDoses = 24 / $therapy->times_per_day;

            $lastLog = TherapyLog::where('therapy_id', $therapy->id)
                ->latest('created_at')
                ->first();

            if (! $lastLog) {
                if (! $this->hasUnreadTherapyReminder($user, $therapy->id)) {
                    $user->notify(new TherapyReminderNotification($therapy));

                    app(\App\Services\PushNotificationService::class)->sendToUser(
                        $user,
                        'Therapy reminder',
                        'It is time to take your therapy.',
                        [
                            'type' => 'therapy_reminder',
                            'therapy_id' => $therapy->id,
                        ]
                    );
                }

                continue;
            }

            $hoursPassed = $lastLog->created_at->diffInHours(now());

            if ($hoursPassed >= $hoursBetweenDoses) {
                if (! $this->hasUnreadTherapyReminder($user, $therapy->id)) {
                    $user->notify(new TherapyReminderNotification($therapy));

                    app(\App\Services\PushNotificationService::class)->sendToUser(
                        $user,
                        'Therapy reminder',
                        'It is time to take your therapy.',
                        [
                            'type' => 'therapy_reminder',
                            'therapy_id' => $therapy->id,
                        ]
                    );
                }
            }
        }
    }

    private function hasUnreadTherapyReminder($user, int $therapyId): bool
    {
        return $user->unreadNotifications()
            ->where('type', TherapyReminderNotification::class)
            ->where('data->therapy_id', $therapyId)
            ->exists();
    }
}