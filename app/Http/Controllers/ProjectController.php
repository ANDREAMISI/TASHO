<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use App\Models\Folder;
use App\Models\Client;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
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

        if (!$team) {
            return redirect()->route('team.create')
                ->with('info', 'Créez une équipe pour commencer à gérer des projets.');
        }

        $query = Project::where('team_id', $team->id);

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('description', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('client_name', 'LIKE', '%' . $request->search . '%');
            });
        }

        $projects = $query->with(['owner', 'folders'])
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->through(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'slug' => $project->slug,
                    'description' => $project->description,
                    'status' => $project->status,
                    'priority' => $project->priority,
                    'client_name' => $project->client_name,
                    'owner' => $project->owner,
                    'folders_count' => $project->folders->count(),
                    'files_count' => $project->files()->count(),
                    'created_at' => $project->created_at,
                    'updated_at' => $project->updated_at,
                ];
            });

        $statuses = ['draft', 'active', 'archived', 'completed'];
        $priorities = ['low', 'medium', 'high'];

        return Inertia::render('Project/Index', [
            'projects' => $projects,
            'filters' => $request->only(['status', 'search']),
            'statuses' => $statuses,
            'priorities' => $priorities,
            'team' => $team,
        ]);
    }

    /**
     * Afficher le formulaire de création
     */
    public function create()
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return redirect()->route('team.create')
                ->with('info', 'Créez une équipe pour commencer à créer des projets.');
        }

        $clients = Client::where('team_id', $team->id)->get(['id', 'name', 'email']);

        return Inertia::render('Project/Create', [
            'team' => $team,
            'clients' => $clients,
            'statuses' => ['draft', 'active', 'archived', 'completed'],
            'priorities' => ['low', 'medium', 'high'],
        ]);
    }

    /**
     * Créer un nouveau projet
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
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
     * Afficher un projet
     */
    public function show(Project $project)
    {
        Gate::authorize('view', $project);

        $project->load([
            'owner',
            'folders' => function ($query) {
                $query->whereNull('parent_id')->with(['children', 'files']);
            },
            'files',
            'members',
            'comments' => function ($query) {
                $query->whereNull('parent_id')->with(['user', 'replies.user']);
            },
            'accesses',
            'logs' => function ($query) {
                $query->recent(10);
            },
        ]);

        $team = $project->team;

        $members = $team->members->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'role' => $member->pivot->role,
            ];
        });

        $canManage = Gate::allows('manageProject', $project);

        return Inertia::render('Project/Show', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'client_name' => $project->client_name,
                'client_email' => $project->client_email,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'created_at' => $project->created_at,
                'owner' => $project->owner,
                'is_owner' => $project->owner_id === auth()->id(),
            ],
            'folders' => $project->folders,
            'files' => $project->files,
            'members' => $members,
            'comments' => $project->comments,
            'accesses' => $project->accesses,
            'logs' => $project->logs,
            'team' => $team,
            'canManage' => $canManage,
        ]);
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

        $folder = $this->projectService->createFolder(
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