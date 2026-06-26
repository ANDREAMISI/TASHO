<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TeamMember
{
    public function handle(Request $request, Closure $next)
    {
        $team = $request->route('team');
        
        if (!$team) {
            abort(404, 'Team not found');
        }

        if (!Gate::allows('view', $team)) {
            abort(403, 'You are not a member of this team');
        }

        return $next($request);
    }
}