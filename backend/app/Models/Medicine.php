<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
    ];

    public function therapies()
    {
        return $this->hasMany(Therapy::class);
    }

    public function therapyLogs()
    {
        return $this->hasMany(TherapyLog::class);
    }
}