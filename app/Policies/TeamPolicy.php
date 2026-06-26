<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function view(User $user, Team $team): bool
    {
        return $user->email === 'admin@tasho.com' || $team->hasMember($user);
    }

    public function create(User $user): bool
    {
        return true; // Tout utilisateur authentifié peut créer une équipe
    }

    public function update(User $user, Team $team): bool
    {
        return $user->email === 'admin@tasho.com' || $team->isOwner($user);
    }

    public function delete(User $user, Team $team): bool
    {
        return $user->email === 'admin@tasho.com' || $team->isOwner($user);
    }

    public function manageMembers(User $user, Team $team): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        $role = $team->getMemberRole($user);
        return in_array($role, ['owner', 'manager']);
    }
}