<?php

namespace App\Services;

use App\Models\AccessLog;
use App\Models\File;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Fenêtre d'analyse par défaut (en jours) pour les tendances.
     */
    private const WINDOW_DAYS = 30;

    /**
     * Profondeur de la série d'activité envoyée au graphique (en jours).
     * Le frontend peut ensuite n'afficher que 30 ou 90 jours.
     */
    private const ACTIVITY_DAYS = 90;

    /**
     * Libellés français des actions journalisées dans `access_logs`.
     */
    private const ACTION_LABELS = [
        'upload' => 'Téléversement',
        'download' => 'Téléchargement',
        'view' => 'Consultation',
        'comment' => 'Commentaire',
        'favorite' => 'Ajout aux favoris',
        'share' => 'Partage',
        'delete' => 'Suppression',
        'update' => 'Modification',
        'create' => 'Création',
        'authenticate' => 'Connexion',
    ];

    /**
     * Catégories de fichiers exposées au dashboard (ordre d'affichage inclus).
     */
    private const FILE_CATEGORIES = [
        'images' => 'Images',
        'videos' => 'Vidéos',
        'documents' => 'Documents',
        'audio' => 'Audio',
        'archives' => 'Archives',
        'others' => 'Autres',
    ];

    /**
     * Contrat de données complet du dashboard client.
     */
    public function getStats(Team $team): array
    {
        $now = Carbon::now();
        $windowStart = $now->copy()->subDays(self::WINDOW_DAYS);
        $previousWindowStart = $now->copy()->subDays(self::WINDOW_DAYS * 2);

        $projectIds = $team->projects()->pluck('id')->all();

        $subscription = $team->subscription()->with('plan')->first();
        $storageLimit = (int) ($subscription?->plan?->storage_limit ?? 1073741824);
        $storageUsed = (int) File::whereIn('project_id', $projectIds)->sum('size');

        $breakdown = $this->fileBreakdown($projectIds);
        $activitySeries = $this->getDailyActivity($projectIds, self::ACTIVITY_DAYS);

        return [
            'team' => [
                'name' => $team->name,
                'members' => $team->members()->count(),
                'owner' => $team->owner?->name,
            ],
            'plan' => [
                'name' => $subscription?->plan?->name,
                'storage_limit' => $storageLimit,
            ],
            'projects' => $this->projectStats($team, $windowStart, $previousWindowStart),
            'files' => $this->fileStats($projectIds, $breakdown, $windowStart, $previousWindowStart),
            'clients' => $this->clientStats($team, $windowStart, $previousWindowStart),
            'storage' => [
                'used' => $storageUsed,
                'limit' => $storageLimit,
                'percentage' => $this->percentage($storageUsed, $storageLimit),
                'by_type' => $this->withShares(array_values($breakdown), $storageUsed),
            ],
            'activity' => [
                'recent' => $this->getRecentActivity($team, 8),
                'series' => $activitySeries,
                'today' => $activitySeries === [] ? 0 : end($activitySeries)['count'],
            ],
            'recent_projects' => $this->getRecentProjects($team, 5),
        ];
    }

    /**
     * Dernières actions enregistrées sur les projets de l'équipe.
     */
    public function getRecentActivity(Team $team, int $limit = 8): array
    {
        return AccessLog::query()
            ->whereIn('project_id', $team->projects()->pluck('id'))
            ->with(['user:id,name', 'project:id,title', 'file:id,name'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (AccessLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'label' => self::ACTION_LABELS[$log->action] ?? ucfirst((string) $log->action),
                'actor' => $log->user?->name ?? $log->visitor_name ?? 'Visiteur anonyme',
                'project' => $log->project?->title,
                'project_id' => $log->project_id,
                'file' => $log->file?->name,
                'created_at' => $log->created_at?->toIso8601String(),
                'time_ago' => $log->created_at?->diffForHumans(),
            ])
            ->all();
    }

    /**
     * Projets les plus récemment mis à jour, avec leur poids sur disque.
     */
    public function getRecentProjects(Team $team, int $limit = 5): array
    {
        return $team->projects()
            ->withCount('files')
            ->withSum('files as files_size', 'size')
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'title' => $project->title,
                'client_name' => $project->client_name,
                'status' => $project->status,
                'priority' => $project->priority,
                'files_count' => (int) $project->files_count,
                'files_size' => (int) ($project->files_size ?? 0),
                'updated_at' => $project->updated_at?->toIso8601String(),
                'updated_human' => $project->updated_at?->diffForHumans(),
            ])
            ->all();
    }

    private function projectStats(Team $team, Carbon $windowStart, Carbon $previousWindowStart): array
    {
        return [
            'total' => $team->projects()->count(),
            'active' => $team->projects()->where('status', 'active')->count(),
            'completed' => $team->projects()->where('status', 'completed')->count(),
            'archived' => $team->projects()->where('status', 'archived')->count(),
            'draft' => $team->projects()->where('status', 'draft')->count(),
            'trend' => $this->trend(
                $team->projects()->where('created_at', '>=', $windowStart)->count(),
                $team->projects()
                    ->where('created_at', '>=', $previousWindowStart)
                    ->where('created_at', '<', $windowStart)
                    ->count()
            ),
        ];
    }

    /**
     * @param  array<string, array{key: string, label: string, count: int, size: int}>  $breakdown
     */
    private function fileStats(array $projectIds, array $breakdown, Carbon $windowStart, Carbon $previousWindowStart): array
    {
        $counts = array_column($breakdown, 'count');

        return [
            'total' => array_sum($counts),
            'total_size' => array_sum(array_column($breakdown, 'size')),
            'images' => $breakdown['images']['count'],
            'videos' => $breakdown['videos']['count'],
            'documents' => $breakdown['documents']['count'],
            'others' => $breakdown['audio']['count'] + $breakdown['archives']['count'] + $breakdown['others']['count'],
            'breakdown' => array_values($breakdown),
            'trend' => $this->trend(
                File::whereIn('project_id', $projectIds)->where('created_at', '>=', $windowStart)->count(),
                File::whereIn('project_id', $projectIds)
                    ->where('created_at', '>=', $previousWindowStart)
                    ->where('created_at', '<', $windowStart)
                    ->count()
            ),
        ];
    }

    private function clientStats(Team $team, Carbon $windowStart, Carbon $previousWindowStart): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();

        return [
            'total' => $team->clients()->count(),
            'active' => $team->clients()->where('last_interaction_at', '>=', $startOfMonth)->count(),
            'trend' => $this->trend(
                $team->clients()->where('created_at', '>=', $windowStart)->count(),
                $team->clients()
                    ->where('created_at', '>=', $previousWindowStart)
                    ->where('created_at', '<', $windowStart)
                    ->count()
            ),
        ];
    }

    /**
     * Répartition des fichiers par catégorie MIME (nombre + poids réel).
     *
     * @return array<string, array{key: string, label: string, count: int, size: int}>
     */
    private function fileBreakdown(array $projectIds): array
    {
        $rows = File::query()
            ->whereIn('project_id', $projectIds)
            ->selectRaw($this->categoryExpression().' as category, COUNT(*) as total, COALESCE(SUM(size), 0) as weight')
            ->groupBy('category')
            ->get()
            ->keyBy('category');

        $breakdown = [];

        foreach (self::FILE_CATEGORIES as $key => $label) {
            $row = $rows->get($key);

            $breakdown[$key] = [
                'key' => $key,
                'label' => $label,
                'count' => (int) ($row->total ?? 0),
                'size' => (int) ($row->weight ?? 0),
            ];
        }

        return $breakdown;
    }

    private function categoryExpression(): string
    {
        return <<<'SQL'
            CASE
                WHEN mime_type LIKE 'image/%' THEN 'images'
                WHEN mime_type LIKE 'video/%' THEN 'videos'
                WHEN mime_type LIKE 'audio/%' THEN 'audio'
                WHEN mime_type LIKE 'application/pdf'
                    OR mime_type LIKE 'application/msword'
                    OR mime_type LIKE 'application/vnd.openxmlformats-officedocument%'
                    OR mime_type LIKE 'application/vnd.ms-%'
                    OR mime_type LIKE 'application/rtf'
                    OR mime_type LIKE 'text/%' THEN 'documents'
                WHEN mime_type LIKE 'application/zip'
                    OR mime_type LIKE 'application/x-rar%'
                    OR mime_type LIKE 'application/x-7z%'
                    OR mime_type LIKE 'application/gzip'
                    OR mime_type LIKE 'application/x-tar' THEN 'archives'
                ELSE 'others'
            END
            SQL;
    }

    /**
     * Série quotidienne continue (jours sans activité inclus à zéro).
     *
     * @return array<int, array{date: string, label: string, count: int}>
     */
    private function getDailyActivity(array $projectIds, int $days): array
    {
        $start = Carbon::today()->subDays($days - 1);

        $counts = AccessLog::query()
            ->whereIn('project_id', $projectIds)
            ->where('created_at', '>=', $start->copy()->startOfDay())
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $series = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i);
            $key = $date->toDateString();

            $series[] = [
                'date' => $key,
                'label' => $date->format('d/m'),
                'count' => (int) ($counts[$key] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * @param  array<int, array{key: string, label: string, count: int, size: int}>  $types
     * @return array<int, array{key: string, label: string, count: int, size: int, percentage: float}>
     */
    private function withShares(array $types, int $total): array
    {
        return array_map(function (array $type) use ($total) {
            $type['percentage'] = $this->percentage($type['size'], $total);

            return $type;
        }, $types);
    }

    /**
     * @return array{current: int, previous: int, delta: int, percent: int|null}
     */
    private function trend(int $current, int $previous): array
    {
        return [
            'current' => $current,
            'previous' => $previous,
            'delta' => $current - $previous,
            'percent' => $previous > 0 ? (int) round((($current - $previous) / $previous) * 100) : null,
        ];
    }

    private function percentage(int $part, int $total): float
    {
        if ($total <= 0) {
            return 0.0;
        }

        return round(min(($part / $total) * 100, 100), 1);
    }

    public function getAdminStats(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        return [
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)
                    ->where('last_active_at', '>=', $startOfMonth)
                    ->count(),
                'new_this_month' => User::where('created_at', '>=', $startOfMonth)->count(),
            ],
            'teams' => [
                'total' => Team::count(),
                'active' => Team::where('is_active', true)->count(),
            ],
            'subscriptions' => [
                'total' => \App\Models\Subscription::where('status', 'active')->count(),
                'by_plan' => $this->getSubscriptionsByPlan(),
            ],
            'storage' => [
                'total' => File::sum('size'),
                'average_per_user' => File::sum('size') / max(User::count(), 1),
            ],
            'activity' => [
                'total_logs' => AccessLog::count(),
                'today' => AccessLog::whereDate('created_at', today())->count(),
            ],
            'recent_users' => User::orderBy('created_at', 'desc')->limit(10)->get(),
        ];
    }

    private function getSubscriptionsByPlan(): array
    {
        return \App\Models\Subscription::where('status', 'active')
            ->with('plan')
            ->get()
            ->groupBy('plan.name')
            ->map(function ($group) {
                return $group->count();
            })
            ->toArray();
    }
}
