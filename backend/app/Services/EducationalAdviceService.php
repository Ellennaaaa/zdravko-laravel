<?php

namespace App\Services;

use App\Models\EducationalAdvice;
use App\Models\Patient;
use Carbon\Carbon;

class EducationalAdviceService
{
    public function getAdviceForPatient(Patient $patient): ?EducationalAdvice
    {
        $age = $patient->birth_date
            ? Carbon::parse($patient->birth_date)->age
            : null;

        return EducationalAdvice::where('is_active', true)
            ->where(function ($query) use ($patient) {
                $query->whereNull('diabetes_type_id')
                    ->orWhere('diabetes_type_id', $patient->diabetes_type_id);
            })
            ->where(function ($query) use ($age) {
                if ($age === null) {
                    $query->whereNull('min_age')
                        ->whereNull('max_age');
                } else {
                    $query->where(function ($q) use ($age) {
                        $q->whereNull('min_age')
                            ->orWhere('min_age', '<=', $age);
                    })
                    ->where(function ($q) use ($age) {
                        $q->whereNull('max_age')
                            ->orWhere('max_age', '>=', $age);
                    });
                }
            })
            ->inRandomOrder()
            ->first();
    }
}