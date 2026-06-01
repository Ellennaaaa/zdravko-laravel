<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Measurement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'value',
        'blood_glucose_unit_id',
        'measured_on',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'measured_on' => 'date',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function bloodGlucoseUnit()
    {
        return $this->belongsTo(BloodGlucoseUnit::class);
    }
}