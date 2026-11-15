<?php

namespace App\Policies;

use App\Models\User;
use App\Models\File;
use App\Models\Project;  

class FilePolicy
{
    public function view(User $user, File $file): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        $project = $file->project;
        $team = $project->team;

        return $project->isOwner($user)
            || $project->hasMember($user)
            || $team->isOwner($user)
            || $team->hasMember($user);
    }

    public function create(User $user, Project $project): bool  
    {
        if ($user->email === 'admin@tasho.com') return true;

        $team = $project->team;

        if ($project->isOwner($user) || $team->isOwner($user)) {
            return true;
        }

        $teamRole = $team->getMemberRole($user);

        if ($teamRole === 'viewer') {
            return false;
        }

        return $project->hasMember($user)
            || in_array($teamRole, ['manager', 'editor'], true);
    }

    public function update(User $user, File $file): bool
    {
        if ($user->email === 'admin@tasho.com') return true;

        $project = $file->project;
        $team = $project->team;

        if ($project->isOwner($user) || $team->isOwner($user)) {
            return true;
        }

        if ($team->getMemberRole($user) === 'viewer') {
            return false;
        }

        return $file->user_id === $user->id
            || $team->getMemberRole($user) === 'manager';
    }

    public function delete(User $user, File $file): bool
    {
        if ($user->email === 'admin@tasho.com') return true;

        $project = $file->project;
        $team = $project->team;

        if ($project->isOwner($user) || $team->isOwner($user)) {
            return true;
        }

        if ($team->getMemberRole($user) === 'viewer') {
            return false;
        }

        return $file->user_id === $user->id;
    }

    public function download(User $user, File $file): bool
    {
        return $this->view($user, $file);
    }
}