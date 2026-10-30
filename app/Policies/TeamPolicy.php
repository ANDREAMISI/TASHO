<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function view(User $user, Team $team): bool
    {
        return $user->isSuperAdmin()
            || $team->owner_id === $user->id
            || $team->hasMember($user);
    }

    public function create(User $user): bool
    {
        return true; // Tout utilisateur authentifié peut créer une équipe
    }

    public function update(User $user, Team $team): bool
    {
        return $user->isSuperAdmin() || $team->isOwner($user);
    }

    public function delete(User $user, Team $team): bool
    {
        return $user->isSuperAdmin() || $team->isOwner($user);
    }

    public function manageMembers(User $user, Team $team): bool
    {
        if ($user->isSuperAdmin() || $team->owner_id === $user->id) {
            return true;
        }

        return $team->getMemberRole($user) === 'manager';
    }
}
