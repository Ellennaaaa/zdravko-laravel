<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AcceptContactInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'exists:emergency_contact_invitations,token'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}