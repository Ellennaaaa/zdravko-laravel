<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('zdravko:send-health-reminders')->everyMinute();
Schedule::command('zdravko:simulate-smart-glucometer-readings')
    ->everyTenMinutes();