<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends ApiController
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        try {
            $user = DB::transaction(function () use ($validated) {
                $role = Role::where('name', $validated['role'])->firstOrFail();

                $user = User::create([
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => $validated['password'],
                    'phone_number' => $validated['phone_number'],
                ]);

                $user->roles()->attach($role->id);

                if ($role->name === UserRole::PATIENT->value) {
                    $user->patient()->create([
                        'birth_date' => $validated['birth_date'],
                        'diabetes_type_id' => $validated['diabetes_type_id'],
                    ]);
                }

                return $user->load(['roles', 'patient']);
            });

            $token = $user->createToken('auth_token')->plainTextToken;

            AuditService::log(
                action: 'user.registered',
                model: 'User',
                modelId: $user->id,
                payload: ['username' => $user->username, 'email' => $user->email, 'role' => $validated['role']]
            );

            return $this->respond([
                'message' => 'Registration successful.',
                'token' => $token,
                'user' => $user,
            ], Response::HTTP_CREATED);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! auth()->attempt($credentials)) {
            AuditService::log(
                action: 'user.login_failed',
                payload: ['email' => $credentials['email']]
            );
            return $this->respondUnauthorized('Invalid credentials.');
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditService::log(
            action: 'user.login',
            model: 'User',
            modelId: $user->id
        );

        return $this->respond([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user->load(['roles', 'patient']),
        ]);
    }

    public function user(Request $request)
    {
        return $this->respond([
            'user' => $request->user()->load(['roles', 'patient']),
        ]);
    }

    public function logout(Request $request)
    {
        AuditService::log(
            action: 'user.logout',
            model: 'User',
            modelId: $request->user()->id
        );

        $request->user()->currentAccessToken()->delete();

        return $this->respond([
            'message' => 'Logged out successfully.',
        ]);
    }
}
