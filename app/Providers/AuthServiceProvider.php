<?php

namespace App\Providers;

use App\Models\Project;
use App\Models\Team;
use App\Models\File;
use App\Policies\ProjectPolicy;
use App\Policies\TeamPolicy;
use App\Policies\FilePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Project::class => ProjectPolicy::class,
        Team::class => TeamPolicy::class,
        File::class => FilePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Gate pour vérifier si l'utilisateur est super admin
        Gate::define('is-super-admin', function ($user) {
            return $user->email === 'admin@tasho.com';
        });

        // Gate pour vérifier les permissions d'équipe
        Gate::define('manage-team', function ($user, Team $team) {
            return $team->isOwner($user) || $user->email === 'admin@tasho.com';
        });

        Gate::define('invite-team-member', function ($user, Team $team) {
            if ($user->email === 'admin@tasho.com') return true;
            $role = $team->getMemberRole($user);
            return in_array($role, ['owner', 'manager']);
        });

        Gate::define('manage-project', function ($user, Project $project) {
            return $project->isOwner($user) || $user->email === 'admin@tasho.com';
        });
    }
}