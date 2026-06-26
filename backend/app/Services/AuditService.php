<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public static function log(
        string $action,
        string $model = null,
        int $modelId = null,
        array $payload = null
    ): void {
        AuditLog::create([
            'user_id'    => Auth::id(),
            'action'     => $action,
            'model'      => $model,
            'model_id'   => $modelId,
            'payload'    => $payload,
            'ip_address' => Request::ip(),
        ]);
    }
}
