<?php

namespace App\Services;

use App\Models\Team;
use App\Models\Project;
use App\Models\File;
use App\Models\Client;
use App\Models\AccessLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(Team $team): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        return [
            'projects' => [
                'total' => $team->projects()->count(),
                'active' => $team->projects()->where('status', 'active')->count(),
                'archived' => $team->projects()->where('status', 'archived')->count(),
                'completed' => $team->projects()->where('status', 'completed')->count(),
            ],
            'files' => [
                'total' => File::whereIn('project_id', $team->projects()->pluck('id'))->count(),
                'total_size' => File::whereIn('project_id', $team->projects()->pluck('id'))->sum('size'),
                'images' => File::whereIn('project_id', $team->projects()->pluck('id'))
                    ->where('mime_type', 'LIKE', 'image/%')->count(),
                'videos' => File::whereIn('project_id', $team->projects()->pluck('id'))
                    ->where('mime_type', 'LIKE', 'video/%')->count(),
                'documents' => File::whereIn('project_id', $team->projects()->pluck('id'))
                    ->whereIn('mime_type', ['application/pdf', 'application/msword', 'text/plain'])
                    ->count(),
            ],
            'clients' => [
                'total' => $team->clients()->count(),
                'active' => $team->clients()
                    ->where('last_interaction_at', '>=', $startOfMonth)
                    ->count(),
            ],
            'team' => [
                'members' => $team->members()->count(),
                'owner' => $team->owner,
            ],
            'activity' => $this->getRecentActivity($team),
            'storage' => [
                'used' => File::whereIn('project_id', $team->projects()->pluck('id'))->sum('size'),
                'limit' => $team->subscription()->first()?->plan?->storage_limit ?? 1073741824, // 1GB par défaut
                'percentage' => $this->calculateStoragePercentage($team),
            ],
            'trends' => $this->getTrends($team),
        ];
    }

    public function getRecentActivity(Team $team, int $limit = 10): array
    {
        return AccessLog::whereIn('project_id', $team->projects()->pluck('id'))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'user' => $log->user?->name ?? $log->visitor_name ?? 'Anonyme',
                    'project' => $log->project?->title,
                    'file' => $log->file?->name,
                    'created_at' => $log->created_at,
                    'time_ago' => $log->created_at->diffForHumans(),
                    'icon' => $this->getActionIcon($log->action),
                ];
            })
            ->toArray();
    }

    public function getTrends(Team $team): array
    {
        $days = 30;
        $startDate = Carbon::now()->subDays($days);

        // Activité quotidienne
        $dailyActivity = AccessLog::whereIn('project_id', $team->projects()->pluck('id'))
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(function ($item) {
                return [Carbon::parse($item->date)->format('Y-m-d') => $item->count];
            })
            ->toArray();

        // Projets créés par mois
        $projectsCreated = Project::where('team_id', $team->id)
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->month => $item->count];
            })
            ->toArray();

        // Fichiers téléchargés par jour
        $filesUploaded = File::whereIn('project_id', $team->projects()->pluck('id'))
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(function ($item) {
                return [Carbon::parse($item->date)->format('Y-m-d') => $item->count];
            })
            ->toArray();

        return [
            'daily_activity' => $dailyActivity,
            'projects_created' => $projectsCreated,
            'files_uploaded' => $filesUploaded,
            'labels' => $this->getDateLabels($days),
        ];
    }

    private function calculateStoragePercentage(Team $team): float
    {
        $used = File::whereIn('project_id', $team->projects()->pluck('id'))->sum('size');
        $limit = $team->subscription()->first()?->plan?->storage_limit ?? 1073741824;

        if ($limit <= 0) {
            return 0;
        }

        return min(($used / $limit) * 100, 100);
    }

    private function getActionIcon(string $action): string
    {
        $icons = [
            'upload' => '📤',
            'download' => '📥',
            'view' => '👁️',
            'comment' => '💬',
            'favorite' => '⭐',
            'share' => '🔗',
            'delete' => '🗑️',
            'update' => '✏️',
            'create' => '✨',
        ];

        return $icons[$action] ?? '📌';
    }

    private function getDateLabels(int $days): array
    {
        $labels = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $labels[] = Carbon::now()->subDays($i)->format('d/m');
        }
        return $labels;
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