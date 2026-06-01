<?php

namespace App\Mail;

use App\Models\EmergencyContactInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmergencyContactInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public EmergencyContactInvitation $invitation
    ) {}

    public function build()
    {
        $acceptUrl = config('app.frontend_url', 'http://127.0.0.1:5173')
            . '/accept-contact-invitation?token='
            . $this->invitation->token;

        return $this->subject('Zdravko emergency contact invitation')
            ->view('emails.emergency-contact-invitation')
            ->with([
                'invitation' => $this->invitation,
                'acceptUrl' => $acceptUrl,
            ]);
    }
}