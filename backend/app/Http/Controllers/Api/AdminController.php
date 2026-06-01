<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Measurement;
use App\Models\Therapy;
use App\Models\SmartGlucometer;
use App\Models\EmergencyContact;

class AdminController extends ApiController
{
    public function stats()
    {
        return $this->respond([
            'users_count' => User::count(),
            'measurements_count' => Measurement::count(),
            'therapies_count' => Therapy::count(),
            'smart_glucometers_count' => SmartGlucometer::count(),
            'emergency_contacts_count' => EmergencyContact::count(),
        ]);
    }

    public function users()
    {
        return $this->respond([
            'users' => User::with('roles')
                ->latest()
                ->get(),
        ]);
    }

    public function measurements()
    {
        return $this->respond([
            'measurements' => Measurement::with([
                'patient.user',
                'bloodGlucoseUnit',
            ])->latest()->get(),
        ]);
    }

    public function smartGlucometers()
    {
        return $this->respond([
            'smart_glucometers' => SmartGlucometer::with([
                'patient.user',
            ])->latest()->get(),
        ]);
    }
}