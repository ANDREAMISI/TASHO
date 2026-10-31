<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Project;
use App\Models\Team;
use App\Services\AuditService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ActivityController extends Controller
{
    /**
     * Libellés français des actions journalisées.
     *
     * @var array<string, string>
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
        'create_client' => 'Client ajouté',
        'update_client' => 'Client modifié',
        'delete_client' => 'Client supprimé',
        'authenticate' => 'Authentification',
        'login' => 'Connexion',
        'logout' => 'Déconnexion',
    ];

    /**
     * Nombre de jours couverts par les statistiques.
     */
    private const STATS_DAYS = 30;

    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Vérifier que l'utilisateur est Super Admin
     */
    private function checkSuperAdmin()
    {
        if (!Auth::check() || !Auth::user()->isSuperAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }

    /**
     * Afficher le journal d'activité de l'équipe.
     */
    public function index(Request $request)
    {
        $team = $request->user()->getActiveTeam();

        if (! $team) {
            return redirect()->route('team.index', ['create' => 1])
                ->with('info', 'Créez une équipe pour voir l\'activité.');
        }

        $filters = $this->buildFilters($request, $team);

        $logs = $this->applyFilters(
            AccessLog::query()
                ->forTeam($team)
                ->with([
                    'user:id,name,email,avatar,updated_at',
                    'project:id,title',
                    'file:id,name,original_name',
                    'client:id,name',
                ]),
            $filters,
        )
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (AccessLog $log) => $this->serializeLog($log));

        return Inertia::render('Activity/Index', [
            'logs' => $logs,
            'stats' => $this->auditService->getTeamActivityStats($team, self::STATS_DAYS),
            'filters' => $filters,
            'actions' => self::ACTION_LABELS,
            'projects' => $team->projects()
                ->orderBy('title')
                ->get(['id', 'title']),
            'users' => $this->teamMembers($team),
            'team' => ['id' => $team->id, 'name' => $team->name],
        ]);
    }

    /**
     * Rediriger vers l'onglet Activité du projet (interface unique).
     */
    public function project(Project $project): RedirectResponse
    {
        Gate::authorize('view', $project);

        return redirect()->route('projects.show', [
            'project' => $project,
            'tab' => 'activity',
        ]);
    }

    /**
     * Exporter les logs filtrés (CSV).
     */
    public function export(Request $request)
    {
        $team = $request->user()->getActiveTeam();

        if (! $team) {
            return back()->withErrors(['message' => 'Aucune équipe trouvée.']);
        }

        $filters = $this->buildFilters($request, $team);

        $logs = $this->applyFilters(
            AccessLog::query()->forTeam($team)->with(['user', 'project', 'file', 'client']),
            $filters,
        )
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="activite-tasho-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($logs) {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8 pour qu'Excel affiche correctement les accents.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Date',
                'Heure',
                'Action',
                'Utilisateur',
                'Email',
                'Projet',
                'Fichier',
                'Client',
                'Détails',
                'IP',
            ], ';', '"', '');

            foreach ($logs as $log) {
                $details = $log->details ? json_decode($log->details, true) : null;

                fputcsv($handle, [
                    $log->created_at?->format('d/m/Y'),
                    $log->created_at?->format('H:i:s'),
                    $this->getActionLabel($log->action),
                    $log->user?->name
                        ?? $log->visitor_name
                        ?? $details['visitor_name']
                        ?? 'Visiteur anonyme',
                    $log->user?->email
                        ?? $log->visitor_email
                        ?? $details['visitor_email']
                        ?? '',
                    $log->project?->title ?? '',
                    $log->file?->original_name ?? $log->file?->name ?? '',
                    $log->client?->name ?? '',
                    $this->formatDetails($log->details),
                    $log->ip_address ?? '',
                ], ';', '"', '');
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Construire et normaliser les filtres de la requête.
     *
     * @return array<string, string|null>
     */
    private function buildFilters(Request $request, Team $team): array
    {
        $action = (string) $request->input('action', '');

        if (! array_key_exists($action, self::ACTION_LABELS)) {
            $action = '';
        }

        $userId = $request->input('user_id');
        $userFilter = null;

        if ($userId === 'anonymous') {
            $userFilter = 'anonymous';
        } elseif (is_numeric($userId)) {
            $userId = (int) $userId;
            $isMember = $team->owner_id === $userId
                || $team->members()->whereKey($userId)->exists();

            if ($isMember) {
                $userFilter = (string) $userId;
            }
        }

        $projectFilter = null;
        $projectId = (int) $request->input('project_id');

        if ($projectId && $team->projects()->whereKey($projectId)->exists()) {
            $projectFilter = (string) $projectId;
        }

        $dateFrom = $request->filled('date_from')
            ? $request->date('date_from')?->toDateString()
            : null;
        $dateTo = $request->filled('date_to')
            ? $request->date('date_to')?->toDateString()
            : null;

        // Une plage inversée est remise dans le bon ordre.
        if ($dateFrom && $dateTo && $dateFrom > $dateTo) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }

        return [
            'action' => $action !== '' ? $action : null,
            'user_id' => $userFilter,
            'project_id' => $projectFilter,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'search' => mb_substr(trim((string) $request->input('search', '')), 0, 100),
        ];
    }

    /**
     * Appliquer les filtres normalisés à une requête de journaux.
     */
    private function applyFilters(Builder $query, array $filters): Builder
    {
        if ($filters['action']) {
            $query->where('action', $filters['action']);
        }

        if ($filters['user_id'] === 'anonymous') {
            $query->whereNull('user_id');
        } elseif ($filters['user_id']) {
            $query->where('user_id', (int) $filters['user_id']);
        }

        if ($filters['project_id']) {
            $query->where('project_id', (int) $filters['project_id']);
        }

        if ($filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if ($filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if ($filters['search'] !== '') {
            $search = '%' . $filters['search'] . '%';

            $query->where(function (Builder $query) use ($search) {
                $query->where('visitor_name', 'LIKE', $search)
                    ->orWhere('visitor_email', 'LIKE', $search)
                    ->orWhere('details', 'LIKE', $search)
                    ->orWhereHas('user', function (Builder $user) use ($search) {
                        $user->where('name', 'LIKE', $search)
                            ->orWhere('email', 'LIKE', $search);
                    })
                    ->orWhereHas('project', fn (Builder $project) => $project->where('title', 'LIKE', $search))
                    ->orWhereHas('file', function (Builder $file) use ($search) {
                        $file->where('name', 'LIKE', $search)
                            ->orWhere('original_name', 'LIKE', $search);
                    })
                    ->orWhereHas('client', fn (Builder $client) => $client->where('name', 'LIKE', $search));
            });
        }

        return $query;
    }

    /**
     * Sérialiser un journal pour le frontend.
     *
     * @return array<string, mixed>
     */
    private function serializeLog(AccessLog $log): array
    {
        $details = $log->details ? json_decode($log->details, true) : null;
        $details = is_array($details) ? $details : null;

        return [
            'id' => $log->id,
            'action' => $log->action,
            'action_label' => $this->getActionLabel($log->action),
            'actor' => $log->user?->name
                ?? $log->visitor_name
                ?? $details['visitor_name']
                ?? 'Visiteur anonyme',
            'actor_email' => $log->user?->email
                ?? $log->visitor_email
                ?? $details['visitor_email']
                ?? null,
            'actor_avatar' => $log->user?->avatar_url,
            'is_anonymous' => $log->user === null,
            'project' => $log->project ? [
                'id' => $log->project->id,
                'title' => $log->project->title,
            ] : null,
            'file' => $log->file ? [
                'id' => $log->file->id,
                'name' => $log->file->original_name ?: $log->file->name,
            ] : null,
            'client' => $log->client ? [
                'id' => $log->client->id,
                'name' => $log->client->name,
            ] : null,
            'details' => $details,
            'ip_address' => $log->ip_address,
            'created_at' => $log->created_at?->toIso8601String(),
            'time_ago' => $log->created_at?->diffForHumans(),
        ];
    }

    /**
     * Membres de l'équipe proposés dans le filtre « Utilisateur ».
     *
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function teamMembers(Team $team)
    {
        return $team->members()
            ->select('users.id as user_id', 'users.name', 'users.email')
            ->orderBy('users.name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
            ]);
    }

    /**
     * Convertir les détails JSON en texte lisible pour l'export.
     */
    private function formatDetails(?string $details): string
    {
        $decoded = $details ? json_decode($details, true) : null;

        if (! is_array($decoded)) {
            return '';
        }

        return collect($decoded)
            ->filter(fn ($value) => $value !== null && $value !== '')
            ->map(fn ($value, $key) => $key . ': ' . (is_scalar($value) ? $value : json_encode($value)))
            ->implode(' | ');
    }

    // ============================================================
    // MÉTHODES ADMIN
    // ============================================================

    /**
     * Admin - Afficher le journal d'activité complet
     */
    public function adminIndex(Request $request)
    {
        $this->checkSuperAdmin();

        $query = AccessLog::with(['user', 'project', 'file', 'client']);

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
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

        $logs = $query->orderBy('created_at', 'desc')
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
            'create_client' => 'Client ajouté',
            'update_client' => 'Client modifié',
            'delete_client' => 'Client supprimé',
            'authenticate' => 'Authentification',
            'login' => 'Connexion',
            'logout' => 'Déconnexion',
        ];

        return Inertia::render('Admin/Activity/Index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'user_id', 'date_from', 'date_to', 'search']),
            'actions' => $actions,
        ]);
    }

    /**
     * Admin - Exporter les logs
     */
    public function adminExport(Request $request)
    {
        $this->checkSuperAdmin();

        $query = AccessLog::with(['user', 'project']);

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="activite_admin_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date', 'Heure', 'Action', 'Utilisateur', 'Email', 'Projet', 'IP']);
            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->created_at->format('Y-m-d'),
                    $log->created_at->format('H:i:s'),
                    $this->getActionLabel($log->action),
                    $log->user ? $log->user->name : ($log->visitor_name ?? 'Anonyme'),
                    $log->user ? $log->user->email : ($log->visitor_email ?? ''),
                    $log->project ? $log->project->title : '',
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
        return self::ACTION_LABELS[$action] ?? ucfirst(str_replace('_', ' ', $action));
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
            'create_client' => 'emerald',
            'update_client' => 'orange',
            'delete_client' => 'red',
            'authenticate' => 'cyan',
            'login' => 'teal',
            'logout' => 'gray',
        ][$action] ?? 'gray';
    }
}
