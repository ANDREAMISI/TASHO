<?php

namespace App\Services;

use App\Models\AccessLog;
use App\Models\Client;
use App\Models\File;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Logger une action
     */
    public function log(
        ?User $user,
        string $action,
        $resource = null,
        array $details = []
    ): void {
        $log = new AccessLog();
        $log->action = $action;
        $log->ip_address = Request::ip();
        $log->user_agent = Request::userAgent();
        $log->session_id = session()->getId();

        if ($user) {
            $log->user_id = $user->id;
        }

        if ($resource) {
            $log->resource_type = get_class($resource);
            $log->resource_id = $resource->getKey();

            // Déterminer le projet, le fichier et le client associés.
            $log->project_id = $resource->project_id
                ?? ($resource instanceof Project ? $resource->id : null);

            $log->file_id = $resource->file_id
                ?? ($resource instanceof File ? $resource->id : null);

            $log->client_id = $resource->client_id
                ?? ($resource instanceof Client ? $resource->id : null);

            // Rattacher l'événement à une équipe, même sans projet.
            $log->team_id = $resource->team_id
                ?? (method_exists($resource, 'project') ? $resource->project?->team_id : null)
                ?? (method_exists($resource, 'file') ? $resource->file?->project?->team_id : null)
                ?? (method_exists($resource, 'client') ? $resource->client?->team_id : null)
                ?? $user?->getActiveTeam()?->id;
        }

        if (! $log->team_id && $user) {
            $log->team_id = $user->getActiveTeam()?->id;
        }

        $log->details = json_encode($details);
        $log->metadata = [
            'url' => Request::fullUrl(),
            'method' => Request::method(),
            'input' => Request::except(['password', 'password_confirmation']),
        ];

        $log->save();
    }

    /**
     * Obtenir l'activité d'un utilisateur
     */
    public function getUserActivity(User $user, int $limit = 50)
    {
        return AccessLog::where('user_id', $user->id)
            ->orWhereHas('project', function ($query) use ($user) {
                $query->where('owner_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtenir l'activité d'un projet
     */
    public function getProjectActivity($projectId, int $limit = 50)
    {
        return AccessLog::where('project_id', $projectId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtenir les statistiques d'activité
     */
    public function getActivityStats($userId = null, $days = 30)
    {
        $query = AccessLog::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->subDays($days));

        return [
            'total_actions' => $query->count(),
            'by_action' => $query->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->get()
                ->pluck('count', 'action')
                ->toArray(),
            'daily' => $query->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date')
                ->toArray(),
        ];
    }

    /**
     * Statistiques d'activité d'une équipe.
     *
     * Les compteurs couvrent tout l'historique de l'équipe ; la série
     * quotidienne se limite aux `$days` derniers jours pour le graphique.
     *
     * @return array<string, mixed>
     */
    public function getTeamActivityStats(Team $team, int $days = 30): array
    {
        $days = max(1, $days);
        $start = now()->subDays($days - 1)->startOfDay();

        $base = AccessLog::query()->forTeam($team);

        $byAction = (clone $base)
            ->select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'action' => $row->action,
                'count' => (int) $row->count,
            ])
            ->all();

        $daily = (clone $base)
            ->where('created_at', '>=', $start)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date');

        $series = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $series[] = [
                'date' => $date,
                'count' => (int) ($daily[$date] ?? 0),
            ];
        }

        return [
            'days' => $days,
            'total' => (clone $base)->count(),
            'today' => (clone $base)->whereDate('created_at', today())->count(),
            'members' => (clone $base)->whereNotNull('user_id')->distinct()->count('user_id'),
            'visitors' => (clone $base)
                ->whereNull('user_id')
                ->whereRaw("COALESCE(visitor_email, JSON_UNQUOTE(JSON_EXTRACT(details, '$.visitor_email'))) IS NOT NULL")
                ->distinct()
                ->count(DB::raw("COALESCE(visitor_email, JSON_UNQUOTE(JSON_EXTRACT(details, '$.visitor_email')))")),
            'projects' => (clone $base)->whereNotNull('project_id')->distinct()->count('project_id'),
            'by_action' => $byAction,
            'daily' => $series,
        ];
    }
}
