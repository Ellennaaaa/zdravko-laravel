<?php

namespace App\Http\Controllers\Api;

use App\Models\PushToken;
use Illuminate\Http\Request;

class PushTokenController extends ApiController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        PushToken::updateOrCreate(
            ['token' => $validated['token']],
            ['user_id' => $request->user()->id]
        );

        return $this->respond([
            'message' => 'Push token saved.',
        ]);
    }
}