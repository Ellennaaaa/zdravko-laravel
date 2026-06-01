<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class SmartGlucometer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'device_name',
        'device_serial',
        'is_active',
        'last_simulated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_simulated_at' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}