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
        return $project->isOwner($user) || $project->hasMember($user);
    }

    public function create(User $user, Project $project): bool  
    {
        if ($user->email === 'admin@tasho.com') return true;
        return $project->isOwner($user) || $project->hasMember($user);
    }

    public function update(User $user, File $file): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        return $file->user_id === $user->id;
    }

    public function delete(User $user, File $file): bool
    {
        if ($user->email === 'admin@tasho.com') return true;
        return $file->user_id === $user->id || $file->project->isOwner($user);
    }

    public function download(User $user, File $file): bool
    {
        return $this->view($user, $file);
    }
}