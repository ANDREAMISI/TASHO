<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Project;
use App\Models\Team;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ActivityController extends Controller
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Afficher le journal d'activité
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return redirect()->route('team.create')
                ->with('info', 'Créez une équipe pour voir l\'activité.');
        }

        $query = AccessLog::whereHas('project', function ($q) use ($team) {
            $q->where('team_id', $team->id);
        });

        // Filtres
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('visitor_name', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('visitor_email', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('action', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('details', 'LIKE', '%' . $request->search . '%');
            });
        }

        $logs = $query->with(['user', 'project', 'file', 'client'])
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'action_label' => $this->getActionLabel($log->action),
                    'action_color' => $this->getActionColor($log->action),
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'visitor_name' => $log->visitor_name,
                    'visitor_email' => $log->visitor_email,
                    'project' => $log->project ? [
                        'id' => $log->project->id,
                        'title' => $log->project->title,
                    ] : null,
                    'file' => $log->file ? [
                        'id' => $log->file->id,
                        'name' => $log->file->name,
                    ] : null,
                    'client' => $log->client ? [
                        'id' => $log->client->id,
                        'name' => $log->client->name,
                    ] : null,
                    'details' => $log->details ? json_decode($log->details, true) : null,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'created_at' => $log->created_at,
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            });

        // Statistiques
        $stats = $this->auditService->getActivityStats(null, 30);

        // Options pour les filtres
        $actions = [
            'upload' => 'Upload',
            'download' => 'Téléchargement',
            'view' => 'Visualisation',
            'comment' => 'Commentaire',
            'favorite' => 'Favori',
            'share' => 'Partage',
            'delete' => 'Suppression',
            'update' => 'Mise à jour',
            'create' => 'Création',
            'authenticate' => 'Authentification',
        ];

        $projects = Project::where('team_id', $team->id)
            ->get(['id', 'title']);

        // ✅ Correction : Spécifier explicitement les colonnes avec alias
        $users = $team->members()
            ->select('users.id as user_id', 'users.name', 'users.email')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            });

        return Inertia::render('Activity/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['action', 'user_id', 'project_id', 'date_from', 'date_to', 'search']),
            'actions' => $actions,
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    /**
     * Afficher l'activité d'un projet spécifique
     */
    public function project(Project $project)
    {
        Gate::authorize('view', $project);

        $logs = $this->auditService->getProjectActivity($project->id, 50);

        return Inertia::render('Activity/Project', [
            'project' => $project,
            'logs' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'action_label' => $this->getActionLabel($log->action),
                    'action_color' => $this->getActionColor($log->action),
                    'user' => $log->user ? $log->user->name : ($log->visitor_name ?? 'Anonyme'),
                    'details' => $log->details ? json_decode($log->details, true) : null,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at,
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            }),
            'stats' => $this->auditService->getActivityStats(null, 30),
        ]);
    }

    /**
     * Exporter les logs
     */
    public function export(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return back()->withErrors(['message' => 'Aucune équipe trouvée.']);
        }

        $query = AccessLog::whereHas('project', function ($q) use ($team) {
            $q->where('team_id', $team->id);
        });

        // Appliquer les filtres
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        // Générer le CSV
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="activite_tasho_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($logs) {
            $handle = fopen('php://output', 'w');
            
            // En-têtes
            fputcsv($handle, [
                'Date',
                'Heure',
                'Action',
                'Utilisateur',
                'Email',
                'Projet',
                'Fichier',
                'Détails',
                'IP',
            ]);

            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->created_at->format('Y-m-d'),
                    $log->created_at->format('H:i:s'),
                    $this->getActionLabel($log->action),
                    $log->user ? $log->user->name : ($log->visitor_name ?? 'Anonyme'),
                    $log->user ? $log->user->email : ($log->visitor_email ?? ''),
                    $log->project ? $log->project->title : '',
                    $log->file ? $log->file->name : '',
                    $log->details ? json_encode(json_decode($log->details, true)) : '',
                    $log->ip_address,
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Obtenir le libellé d'une action
     */
    private function getActionLabel(string $action): string
    {
        return [
            'upload' => 'Upload',
            'download' => 'Téléchargement',
            'view' => 'Visualisation',
            'comment' => 'Commentaire',
            'favorite' => 'Favori',
            'share' => 'Partage',
            'delete' => 'Suppression',
            'update' => 'Mise à jour',
            'create' => 'Création',
            'authenticate' => 'Authentification',
        ][$action] ?? $action;
    }

    /**
     * Obtenir la couleur d'une action
     */
    private function getActionColor(string $action): string
    {
        return [
            'upload' => 'blue',
            'download' => 'green',
            'view' => 'gray',
            'comment' => 'purple',
            'favorite' => 'yellow',
            'share' => 'indigo',
            'delete' => 'red',
            'update' => 'orange',
            'create' => 'emerald',
            'authenticate' => 'cyan',
        ][$action] ?? 'gray';
    }
}