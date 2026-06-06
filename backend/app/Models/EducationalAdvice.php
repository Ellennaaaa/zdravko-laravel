<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EducationalAdvice extends Model
{
    use SoftDeletes;

    protected $table = 'educational_advices';

    protected $fillable = [
        'diabetes_type_id',
        'min_age',
        'max_age',
        'title',
        'content',
        'is_active',
    ];
}