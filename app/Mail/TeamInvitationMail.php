<?php

namespace App\Mail;

use App\Models\TeamInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeamInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public TeamInvitation $invitation
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invitation à rejoindre l'équipe {$this->invitation->team->name} sur TASHO",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.team-invitation',
            with: [
                'invitation' => $this->invitation,
                'team' => $this->invitation->team,
                'invitedBy' => $this->invitation->invitedBy,
                'acceptUrl' => route('team.accept-invitation', $this->invitation->token),
                'roleLabel' => $this->getRoleLabel($this->invitation->role),
            ],
        );
    }

    private function getRoleLabel(string $role): string
    {
        return match($role) {
            'owner' => 'Propriétaire',
            'manager' => 'Manager',
            'editor' => 'Éditeur',
            'viewer' => 'Observateur',
            default => $role,
        };
    }
}