<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApiController extends Controller
{
    public function projectStats(Project $project): JsonResponse
    {
        return response()->json([
            'project_id' => $project->id,
            'files' => $project->files()->count(),
            'members' => $project->members()->count() ?? 0,
            'storage' => $project->files()->sum('size'),
        ]);
    }

    public function teamStats(Team $team): JsonResponse
    {
        return response()->json([
            'team_id' => $team->id,
            'projects' => $team->projects()->count(),
            'members' => $team->members()->count(),
            'clients' => $team->clients()->count(),
        ]);
    }
}
