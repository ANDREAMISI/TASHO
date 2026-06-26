<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        return $project->isOwner($user) || $project->hasMember($user);
    }

    public function create(User $user, Team $team): bool
    {
        return $user->email === 'admin@tasho.com' || $team->hasMember($user);
    }

    public function update(User $user, Project $project): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        return $project->isOwner($user);
    }

    public function delete(User $user, Project $project): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        return $project->isOwner($user);
    }

    public function manageMembers(User $user, Project $project): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        return $project->isOwner($user);
    }
}