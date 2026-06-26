<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectAccess;
use App\Models\Client;
use App\Services\ShareService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShareController extends Controller
{
    protected ShareService $shareService;
    protected AuditService $auditService;

    public function __construct(ShareService $shareService, AuditService $auditService)
    {
        $this->shareService = $shareService;
        $this->auditService = $auditService;
    }

    /**
     * Afficher les partages d'un projet
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return redirect()->route('team.create')
                ->with('info', 'Créez une équipe pour gérer vos partages.');
        }

        $projectId = $request->get('project_id');
        $project = null;
        $accesses = [];

        if ($projectId) {
            $project = Project::where('team_id', $team->id)
                ->where('id', $projectId)
                ->firstOrFail();

            Gate::authorize('view', $project);

            $accesses = $project->accesses()
                ->with(['client'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($access) {
                    return [
                        'id' => $access->id,
                        'access_token' => $access->access_token,
                        'is_public' => $access->is_public,
                        'can_download' => $access->can_download,
                        'can_comment' => $access->can_comment,
                        'can_favorite' => $access->can_favorite,
                        'expires_at' => $access->expires_at,
                        'view_count' => $access->view_count,
                        'max_views' => $access->max_views,
                        'last_accessed_at' => $access->last_accessed_at,
                        'client' => $access->client,
                        'share_url' => route('public.gallery', $access->access_token),
                        'created_at' => $access->created_at,
                    ];
                });
        }

        $projects = Project::where('team_id', $team->id)
            ->whereIn('status', ['active', 'completed'])
            ->get(['id', 'title']);

        return Inertia::render('Share/Index', [
            'projects' => $projects,
            'selectedProject' => $project,
            'accesses' => $accesses,
            'team' => $team,
        ]);
    }

    /**
     * Créer un partage
     */
    public function share(Request $request, Project $project)
    {
        Gate::authorize('update', $project);

        $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'client_email' => 'nullable|email',
            'client_name' => 'nullable|string|max:255',
            'is_public' => 'boolean',
            'can_download' => 'boolean',
            'can_comment' => 'boolean',
            'can_favorite' => 'boolean',
            'expires_in_days' => 'nullable|integer|min:1|max:365',
            'max_views' => 'nullable|integer|min:1',
            'password' => 'nullable|string|min:4|max:20',
        ]);

        // Si un client_id est fourni, on l'utilise
        // Sinon, on crée un client à partir des informations
        $client = null;
        if ($request->client_id) {
            $client = Client::find($request->client_id);
        } elseif ($request->client_email) {
            // Vérifier si le client existe déjà
            $existingClient = Client::where('team_id', $project->team_id)
                ->where('email', $request->client_email)
                ->first();

            if ($existingClient) {
                $client = $existingClient;
            } else {
                // Créer un nouveau client
                $client = Client::create([
                    'team_id' => $project->team_id,
                    'name' => $request->client_name ?? $request->client_email,
                    'email' => $request->client_email,
                ]);
            }
        }

        $access = $this->shareService->createAccess(
            $project,
            $client,
            [
                'is_public' => $request->is_public ?? false,
                'can_download' => $request->can_download ?? true,
                'can_comment' => $request->can_comment ?? true,
                'can_favorite' => $request->can_favorite ?? true,
                'expires_in_days' => $request->expires_in_days ?? 30,
                'max_views' => $request->max_views,
                'password' => $request->password,
            ]
        );

        // Log l'activité
        $this->auditService->log(
            auth()->user(),
            'share',
            $project,
            ['access_id' => $access->id, 'client_id' => $client?->id]
        );

        return back()->with('success', 'Partage créé avec succès !');
    }

    /**
     * Révoquer un accès
     */
    public function revoke(ProjectAccess $access)
    {
        Gate::authorize('update', $access->project);

        $access->delete();

        return back()->with('success', 'Accès révoqué avec succès !');
    }

    /**
     * Mettre à jour un partage
     */
    public function update(Request $request, ProjectAccess $access)
    {
        Gate::authorize('update', $access->project);

        $request->validate([
            'can_download' => 'boolean',
            'can_comment' => 'boolean',
            'can_favorite' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $access->update($request->all());

        return back()->with('success', 'Partage mis à jour avec succès !');
    }

    /**
     * Afficher la galerie publique
     */
    public function publicGallery($token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        // Vérifier si l'accès est expiré
        if ($access->expires_at && $access->expires_at->isPast()) {
            return Inertia::render('Gallery/Expired');
        }

        // Vérifier le nombre de vues
        if ($access->max_views && $access->view_count >= $access->max_views) {
            return Inertia::render('Gallery/LimitReached');
        }

        // Incrémenter le compteur de vues
        $access->increment('view_count');
        $access->update(['last_accessed_at' => now()]);

        // Vérifier si un mot de passe est requis
        if (!$access->is_public && !session('gallery_authenticated_' . $access->id)) {
            return Inertia::render('Gallery/Authenticate', [
                'access' => $access,
                'token' => $token,
            ]);
        }

        // Récupérer les fichiers du projet
        $project = $access->project;
        $project->load(['files' => function ($query) {
            $query->where('is_public', true)->orWhere('is_public', false);
        }, 'folders']);

        return Inertia::render('Gallery/Show', [
            'access' => $access,
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'client_name' => $project->client_name,
            ],
            'files' => $this->shareService->getAccessibleFiles($access),
            'folders' => $this->shareService->getAccessibleFolders($access),
            'permissions' => [
                'can_download' => $access->can_download,
                'can_comment' => $access->can_comment,
                'can_favorite' => $access->can_favorite,
            ],
        ]);
    }

    /**
     * Authentifier pour la galerie
     */
    public function authenticateGallery(Request $request, $token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        if ($access->is_public) {
            session(['gallery_authenticated_' . $access->id => true]);
            return redirect()->route('public.gallery', $token);
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        if ($request->password === $access->password) {
            session(['gallery_authenticated_' . $access->id => true]);
            
            // Log l'accès
            $this->auditService->log(
                null,
                'authenticate',
                $access,
                ['visitor_name' => $request->name, 'visitor_email' => $request->email]
            );

            return redirect()->route('public.gallery', $token);
        }

        return back()->withErrors(['password' => 'Mot de passe incorrect.']);
    }

    /**
     * Commenter dans la galerie
     */
    public function comment(Request $request, $token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        if (!$access->can_comment) {
            return response()->json(['error' => 'Les commentaires sont désactivés.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'content' => 'required|string|max:1000',
            'file_id' => 'nullable|exists:files,id',
        ]);

        $comment = $access->project->comments()->create([
            'visitor_name' => $request->name,
            'visitor_email' => $request->email,
            'content' => $request->content,
            'file_id' => $request->file_id,
        ]);

        // Log le commentaire
        $this->auditService->log(
            null,
            'comment',
            $comment,
            [
                'access_id' => $access->id,
                'visitor_name' => $request->name,
                'visitor_email' => $request->email,
            ]
        );

        return response()->json(['success' => true, 'comment' => $comment]);
    }

    /**
     * Ajouter un favori
     */
    public function favoriteGallery(Request $request, $token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        if (!$access->can_favorite) {
            return response()->json(['error' => 'Les favoris sont désactivés.'], 403);
        }

        $request->validate([
            'file_id' => 'required|exists:files,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        $favorite = $access->project->files()
            ->find($request->file_id)
            ->favorites()
            ->create([
                'visitor_email' => $request->email,
                'metadata' => [
                    'name' => $request->name,
                    'access_id' => $access->id,
                ],
            ]);

        return response()->json(['success' => true, 'favorite' => $favorite]);
    }
}