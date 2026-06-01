<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Measurement;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'birth_date',
        'diabetes_type_id',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function diabetesType()
    {
        return $this->belongsTo(DiabetesType::class);
    }

    public function measurements()
    {
        return $this->hasMany(Measurement::class);
    }

    public function smartGlucometers()
    {
        return $this->hasMany(SmartGlucometer::class);
    }
}