<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\AcceptContactInvitationRequest;
use App\Http\Requests\EmergencyContactInvitationRequest;
use App\Mail\EmergencyContactInvitationMail;
use App\Models\EmergencyContact;
use App\Models\EmergencyContactInvitation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EmergencyContactInvitationController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can view invitations.', 403);
        }

        $invitations = EmergencyContactInvitation::where('patient_id', $user->patient->id)
            ->latest()
            ->get();

        return $this->respond([
            'invitations' => $invitations,
        ]);
    }

    public function store(EmergencyContactInvitationRequest $request)
    {
        $user = $request->user()->load('patient');

        if (! $user->patient) {
            return $this->respondWithError('Only patients can invite emergency contacts.', 403);
        }

        $validated = $request->validated();

        try {
            $invitation = EmergencyContactInvitation::create([
                'patient_id' => $user->patient->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'],
                'relationship' => $validated['relationship'],
                'token' => Str::random(64),
                'expires_at' => now()->addDays(7),
            ]);

            Mail::to($invitation->email)->send(
                new EmergencyContactInvitationMail($invitation)
            );

            return $this->respond([
                'message' => 'Emergency contact invitation sent successfully.',
                'invitation' => $invitation,
            ], Response::HTTP_CREATED);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function accept(AcceptContactInvitationRequest $request)
    {
        $validated = $request->validated();

        try {
            $result = DB::transaction(function () use ($validated) {
                $invitation = EmergencyContactInvitation::where('token', $validated['token'])
                    ->firstOrFail();

                if ($invitation->accepted_at) {
                    abort(422, 'Invitation already accepted.');
                }

                if ($invitation->expires_at && now()->greaterThan($invitation->expires_at)) {
                    abort(422, 'Invitation expired.');
                }

                $contactRole = Role::where('name', 'contact')->firstOrFail();

                $user = User::where('email', $invitation->email)->first();

                if (! $user) {
                    $baseUsername = Str::slug($invitation->name, '');
                    $username = $baseUsername ?: 'contact';

                    $counter = 1;
                    while (User::where('username', $username)->exists()) {
                        $username = $baseUsername . $counter;
                        $counter++;
                    }

                    $user = User::create([
                        'username' => $username,
                        'email' => $invitation->email,
                        'password' => $validated['password'],
                        'phone_number' => $invitation->phone_number,
                    ]);
                }

                if (! $user->roles()->where('name', 'contact')->exists()) {
                    $user->roles()->attach($contactRole->id);
                }

                $contact = EmergencyContact::firstOrCreate(
                    [
                        'patient_id' => $invitation->patient_id,
                        'contact_user_id' => $user->id,
                    ],
                    [
                        'relationship' => $invitation->relationship,
                        'is_active' => true,
                    ]
                );

                $invitation->update([
                    'accepted_at' => now(),
                ]);

                $token = $user->createToken('auth_token')->plainTextToken;

                return [
                    'user' => $user->load(['roles']),
                    'contact' => $contact->load('contactUser'),
                    'token' => $token,
                ];
            });

            return $this->respond([
                'message' => 'Invitation accepted successfully.',
                'token' => $result['token'],
                'user' => $result['user'],
                'emergency_contact' => $result['contact'],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}