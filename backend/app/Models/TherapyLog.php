<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class TherapyLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'therapy_id',
        'medicine_id',
        'dosage',
        'unit_id',
        'taken_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'taken_at' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function therapy()
    {
        return $this->belongsTo(Therapy::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}