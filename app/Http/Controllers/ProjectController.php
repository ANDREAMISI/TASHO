<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Client;
use App\Models\Folder;
use App\Models\Project;
use App\Services\ProjectService;
use App\Support\FileCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProjectController extends Controller
{
    protected ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    /**
     * Afficher la liste des projets
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (! $team) {
            return redirect()->route('team.index', ['create' => 1])
                ->with('info', 'Créez une équipe pour commencer à gérer des projets.');
        }

        $statuses = ['draft', 'active', 'archived', 'completed'];
        $priorities = ['low', 'medium', 'high'];
        $sorts = ['recent', 'created', 'name', 'oldest'];

        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'status' => (string) $request->input('status', ''),
            'priority' => (string) $request->input('priority', ''),
            'sort' => (string) $request->input('sort', 'recent'),
        ];

        if (! in_array($filters['status'], $statuses, true)) {
            $filters['status'] = '';
        }

        if (! in_array($filters['priority'], $priorities, true)) {
            $filters['priority'] = '';
        }

        if (! in_array($filters['sort'], $sorts, true)) {
            $filters['sort'] = 'recent';
        }

        $query = Project::query()
            ->where('team_id', $team->id)
            ->with(['owner:id,name,email'])
            ->withCount(['files', 'folders', 'members'])
            ->withSum('files as files_size', 'size');

        if ($filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if ($filters['priority'] !== '') {
            $query->where('priority', $filters['priority']);
        }

        if ($filters['search'] !== '') {
            $search = '%' . $filters['search'] . '%';

            $query->where(function ($query) use ($search) {
                $query->where('title', 'LIKE', $search)
                    ->orWhere('description', 'LIKE', $search)
                    ->orWhere('client_name', 'LIKE', $search)
                    ->orWhere('client_email', 'LIKE', $search);
            });
        }

        match ($filters['sort']) {
            'created' => $query->orderByDesc('created_at'),
            'name' => $query->orderBy('title'),
            'oldest' => $query->orderBy('created_at'),
            default => $query->orderByDesc('updated_at'),
        };

        $projects = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Project $project) => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'client_name' => $project->client_name,
                'client_email' => $project->client_email,
                'owner' => $project->owner
                    ? ['id' => $project->owner->id, 'name' => $project->owner->name]
                    : null,
                'files_count' => (int) $project->files_count,
                'folders_count' => (int) $project->folders_count,
                'members_count' => (int) $project->members_count,
                'files_size' => (int) ($project->files_size ?? 0),
                'start_date' => $project->start_date?->toIso8601String(),
                'end_date' => $project->end_date?->toIso8601String(),
                'created_at' => $project->created_at?->toIso8601String(),
                'updated_at' => $project->updated_at?->toIso8601String(),
                'is_owner' => $project->owner_id === $user->id,
            ]);

        return Inertia::render('Project/Index', [
            'projects' => $projects,
            'filters' => $filters,
            'summary' => $this->projectService->getIndexSummary($team),
            'statuses' => $statuses,
            'priorities' => $priorities,
            'team' => ['id' => $team->id, 'name' => $team->name],
            'clients' => Client::where('team_id', $team->id)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'openCreate' => $request->boolean('create'),
        ]);
    }

    /**
     * Créer un nouveau projet
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (! $team) {
            return back()->withErrors(['message' => 'Aucune équipe trouvée.']);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'client_id' => 'nullable|exists:clients,id',
            'client_name' => 'nullable|string|max:255',
            'client_email' => 'nullable|email|max:255',
            'status' => 'required|in:draft,active,archived,completed',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $project = $this->projectService->createProject(
            $team,
            $user,
            $request->all()
        );

        // Créer les dossiers par défaut
        $this->projectService->createDefaultFolders($project);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Projet créé avec succès !');
    }

    /**
     * Afficher un projet (espace projet, onglets inclus).
     */
    public function show(Request $request, Project $project)
    {
        Gate::authorize('view', $project);

        $tabs = ['overview', 'files', 'activity', 'shares'];
        $tab = (string) $request->input('tab', 'overview');

        if (! in_array($tab, $tabs, true)) {
            $tab = 'overview';
        }

        $project->load(['owner:id,name,email']);
        $team = $project->team;

        $payload = [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'client_name' => $project->client_name,
                'client_email' => $project->client_email,
                'start_date' => $project->start_date?->toIso8601String(),
                'end_date' => $project->end_date?->toIso8601String(),
                'created_at' => $project->created_at?->toIso8601String(),
                'updated_at' => $project->updated_at?->toIso8601String(),
                'owner' => $project->owner
                    ? [
                        'id' => $project->owner->id,
                        'name' => $project->owner->name,
                        'email' => $project->owner->email,
                    ]
                    : null,
                'is_owner' => $project->owner_id === auth()->id(),
            ],
            'team' => ['id' => $team->id, 'name' => $team->name],
            'stats' => $this->projectService->getProjectStats($project),
            'tab' => $tab,
            'canManage' => Gate::allows('update', $project),
            'canManageMembers' => Gate::allows('manageMembers', $project),
            'canUpload' => Gate::allows('create', [\App\Models\File::class, $project]),
            'folderTree' => $this->projectService->getFolderTree($project),
            'currentFolderId' => null,
        ];

        if ($tab === 'overview') {
            $payload['members'] = $project->members()
                ->get()
                ->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => $member->pivot->role,
                ]);

            $payload['teamMembers'] = $payload['canManageMembers']
                ? $team->members()
                    ->get()
                    ->map(fn ($member) => [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'role' => $member->pivot->role,
                    ])
                    ->values()
                : [];

            $payload['recentFiles'] = $this->projectService->getRecentFiles($project, 6);
            $payload['recentLogs'] = $this->projectService->getRecentLogs($project, 8);

            $payload['comments'] = $project->comments()
                ->with('user:id,name')
                ->whereNull('parent_id')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($comment) => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'author' => $comment->user?->name ?? $comment->visitor_name ?? 'Anonyme',
                    'created_at' => $comment->created_at?->toIso8601String(),
                    'time_ago' => $comment->created_at?->diffForHumans(),
                ]);
        }

        if ($tab === 'files') {
            $filters = [
                'folder_id' => $request->filled('folder_id') ? (int) $request->input('folder_id') : null,
                'category' => (string) $request->input('category', ''),
                'search' => trim((string) $request->input('search', '')),
                'sort' => (string) $request->input('sort', 'recent'),
                'favorite' => $request->boolean('favorite'),
            ];

            if (! in_array($filters['sort'], ['recent', 'oldest', 'name', 'size'], true)) {
                $filters['sort'] = 'recent';
            }

            if (! FileCategory::isKnown($filters['category'])) {
                $filters['category'] = '';
            }

            $currentFolder = null;

            if ($filters['folder_id']) {
                $currentFolder = Folder::where('project_id', $project->id)
                    ->find($filters['folder_id']);

                if (! $currentFolder) {
                    $filters['folder_id'] = null;
                }
            }

            $payload['files'] = $this->projectService->getFiles($project, $filters);
            $payload['folders'] = $this->projectService->getFolders($project, $currentFolder?->id);
            $payload['currentFolder'] = $currentFolder
                ? ['id' => $currentFolder->id, 'name' => $currentFolder->name]
                : null;
            $payload['currentFolderId'] = $currentFolder?->id;
            $payload['breadcrumb'] = $this->projectService->getBreadcrumb($currentFolder);
            $payload['filters'] = $filters;
            $payload['folderOptions'] = $this->projectService->getFolderOptions($project);
        }

        if ($tab === 'activity') {
            $action = (string) $request->input('action', '');

            $query = AccessLog::query()
                ->where('project_id', $project->id)
                ->with(['user:id,name,email', 'file:id,original_name', 'client:id,name'])
                ->orderByDesc('created_at');

            if ($action !== '') {
                $query->where('action', $action);
            }

            $payload['logs'] = $query
                ->paginate(25)
                ->withQueryString()
                ->through(fn (AccessLog $log) => $this->projectService->mapActivity($log));

            $payload['activitySummary'] = $this->projectService->getActivitySummary($project);
            $payload['filters'] = ['action' => $action];
        }

        if ($tab === 'shares') {
            $payload['accesses'] = $project->accesses()
                ->with(['client'])
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($access) => [
                    'id' => $access->id,
                    'access_token' => $access->access_token,
                    'is_public' => $access->is_public,
                    'can_download' => $access->can_download,
                    'can_comment' => $access->can_comment,
                    'can_favorite' => $access->can_favorite,
                    'expires_at' => $access->expires_at?->toIso8601String(),
                    'view_count' => $access->view_count,
                    'max_views' => $access->max_views,
                    'last_accessed_at' => $access->last_accessed_at?->toIso8601String(),
                    'client' => $access->client
                        ? [
                            'id' => $access->client->id,
                            'name' => $access->client->name,
                            'email' => $access->client->email,
                        ]
                        : null,
                    'share_url' => route('public.gallery', $access->access_token),
                    'created_at' => $access->created_at?->toIso8601String(),
                ]);

            $payload['clients'] = Client::where('team_id', $project->team_id)
                ->orderBy('name')
                ->get(['id', 'name', 'email']);
        }

        return Inertia::render('Project/Show', $payload);
    }

    /**
     * Mettre à jour un projet
     */
    public function update(Request $request, Project $project)
    {
        Gate::authorize('update', $project);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'client_name' => 'nullable|string|max:255',
            'client_email' => 'nullable|email|max:255',
            'status' => 'required|in:draft,active,archived,completed',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $project->update($request->all());

        return back()->with('success', 'Projet mis à jour avec succès !');
    }

    /**
     * Supprimer un projet
     */
    public function destroy(Project $project)
    {
        Gate::authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Projet supprimé avec succès !');
    }

    /**
     * Créer un dossier
     */
    public function createFolder(Request $request, Project $project)
    {
        Gate::authorize('update', $project);

        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id',
        ]);

        $this->projectService->createFolder(
            $project,
            $request->name,
            $request->parent_id,
            auth()->user()
        );

        return back()->with('success', 'Dossier créé avec succès !');
    }

    /**
     * Supprimer un dossier
     */
    public function deleteFolder(Folder $folder)
    {
        Gate::authorize('update', $folder->project);

        $folder->delete();

        return back()->with('success', 'Dossier supprimé avec succès !');
    }

    /**
     * Renommer un dossier
     */
    public function renameFolder(Request $request, Folder $folder)
    {
        Gate::authorize('update', $folder->project);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $folder->update(['name' => $request->name]);

        return back()->with('success', 'Dossier renommé avec succès !');
    }

    /**
     * Ajouter un membre au projet
     */
    public function addMember(Request $request, Project $project)
    {
        Gate::authorize('manageMembers', $project);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:manager,editor,viewer',
        ]);

        // Vérifier si le membre est déjà dans le projet
        if ($project->members()->where('user_id', $request->user_id)->exists()) {
            return back()->withErrors(['message' => 'Ce membre est déjà dans le projet.']);
        }

        $project->members()->attach($request->user_id, [
            'role' => $request->role,
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Membre ajouté au projet avec succès !');
    }

    /**
     * Retirer un membre du projet
     */
    public function removeMember(Project $project, $userId)
    {
        Gate::authorize('manageMembers', $project);

        // Empêcher la suppression du propriétaire
        if ($project->owner_id == $userId) {
            return back()->withErrors(['message' => 'Vous ne pouvez pas retirer le propriétaire du projet.']);
        }

        $project->members()->detach($userId);

        return back()->with('success', 'Membre retiré du projet avec succès !');
    }

    /**
     * Mettre à jour le rôle d'un membre
     */
    public function updateMemberRole(Request $request, Project $project, $userId)
    {
        Gate::authorize('manageMembers', $project);

        $request->validate([
            'role' => 'required|in:manager,editor,viewer',
        ]);

        // Empêcher la modification du rôle du propriétaire
        if ($project->owner_id == $userId) {
            return back()->withErrors(['message' => 'Vous ne pouvez pas modifier le rôle du propriétaire.']);
        }

        $project->members()->updateExistingPivot($userId, [
            'role' => $request->role,
        ]);

        return back()->with('success', 'Rôle mis à jour avec succès !');
    }
}
