<?php

namespace App\Services;

use App\Models\AccessLog;
use App\Models\User;
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
            $log->resource_id = $resource->id;

            // Déterminer le projet et le fichier associés
            if (method_exists($resource, 'project')) {
                $log->project_id = $resource->project_id;
            } elseif (property_exists($resource, 'project_id')) {
                $log->project_id = $resource->project_id;
            }

            if (method_exists($resource, 'file')) {
                $log->file_id = $resource->file_id;
            } elseif (property_exists($resource, 'file_id')) {
                $log->file_id = $resource->file_id;
            }
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
            'by_action' => $query->select('action', \DB::raw('count(*) as count'))
                ->groupBy('action')
                ->get()
                ->pluck('count', 'action')
                ->toArray(),
            'daily' => $query->select(\DB::raw('DATE(created_at) as date'), \DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date')
                ->toArray(),
        ];
    }
}