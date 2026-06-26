<?php

namespace App\Services;

use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\User;
use App\Mail\TeamInvitationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TeamService
{
    /**
     * Créer une nouvelle équipe
     */
    public function createTeam(User $owner, string $name, ?string $description = null): Team
    {
        $team = Team::create([
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(6),
            'owner_id' => $owner->id,
            'description' => $description,
        ]);

        // Ajouter le propriétaire comme membre
        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return $team;
    }

    /**
     * Créer une invitation
     */
    public function createInvitation(
        Team $team,
        User $invitedBy,
        ?string $email,
        string $role,
        array $permissions = [],
        array $projectAccess = []
    ): TeamInvitation {
        $invitation = TeamInvitation::create([
            'team_id' => $team->id,
            'invited_by' => $invitedBy->id,
            'email' => $email,
            'token' => Str::random(64),
            'role' => $role,
            'permissions' => $permissions,
            'project_access' => $projectAccess,
            'expires_at' => now()->addDays(7),
            'status' => 'pending',
        ]);

        return $invitation;
    }

    /**
     * Envoyer l'email d'invitation
     */
    public function sendInvitationEmail(TeamInvitation $invitation): void
    {
        if (!$invitation->email) {
            return;
        }

        Mail::to($invitation->email)->send(new TeamInvitationMail($invitation));
    }

    /**
     * Accepter une invitation
     */
    public function acceptInvitation(TeamInvitation $invitation, User $user): void
    {
        // Ajouter l'utilisateur à l'équipe
        TeamMember::create([
            'team_id' => $invitation->team_id,
            'user_id' => $user->id,
            'role' => $invitation->role,
            'permissions' => $invitation->permissions,
            'joined_at' => now(),
        ]);

        // Marquer l'invitation comme acceptée
        $invitation->update([
            'status' => 'accepted',
        ]);
    }

    /**
     * Vérifier si un utilisateur a une permission spécifique dans l'équipe
     */
    public function hasPermission(Team $team, User $user, string $permission): bool
    {
        $member = $team->members()->where('user_id', $user->id)->first();

        if (!$member) {
            return false;
        }

        // Le propriétaire a toutes les permissions
        if ($team->owner_id === $user->id) {
            return true;
        }

        $permissions = $member->pivot->permissions ?? [];

        return in_array($permission, $permissions) || $member->pivot->role === 'manager';
    }

    /**
     * Obtenir les permissions d'un membre dans l'équipe
     */
    public function getMemberPermissions(Team $team, User $user): array
    {
        $member = $team->members()->where('user_id', $user->id)->first();

        if (!$member) {
            return [];
        }

        if ($team->owner_id === $user->id) {
            return ['*']; // Toutes les permissions
        }

        return $member->pivot->permissions ?? [];
    }

    /**
     * Vérifier si un utilisateur peut accéder à un projet spécifique
     */
    public function canAccessProject(Team $team, User $user, int $projectId): bool
    {
        $member = $team->members()->where('user_id', $user->id)->first();

        if (!$member) {
            return false;
        }

        // Le propriétaire et les managers ont accès à tous les projets
        if ($team->owner_id === $user->id || $member->pivot->role === 'manager') {
            return true;
        }

        // Vérifier si le projet est dans les accès autorisés
        $projectAccess = $member->pivot->project_access ?? [];

        return in_array($projectId, $projectAccess);
    }

    /**
     * Mettre à jour la dernière activité d'un membre
     */
    public function updateLastActivity(Team $team, User $user): void
    {
        $team->members()->updateExistingPivot($user->id, [
            'last_activity_at' => now(),
        ]);
    }
}