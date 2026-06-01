<?php

namespace App\Enums;

enum UserRole: string
{
    case PATIENT = 'patient';
    case CONTACT = 'contact';
    case ADMIN = 'admin';

    public static function publicValues(): array
    {
        return [
            self::PATIENT->value,
            self::CONTACT->value,
        ];
    }
}
