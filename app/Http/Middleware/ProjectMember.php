<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectMember
{
    public function handle(Request $request, Closure $next)
    {
        $project = $request->route('project');
        
        if (!$project) {
            abort(404, 'Project not found');
        }

        if (!Gate::allows('view', $project)) {
            abort(403, 'You do not have access to this project');
        }

        return $next($request);
    }
}