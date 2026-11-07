<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\File;
use App\Models\Project;
use App\Models\ProjectAccess;
use App\Support\FileCategory;
use App\Services\AuditService;
use App\Services\NotificationService;
use App\Services\ShareService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use ZipStream\CompressionMethod;
use ZipStream\ZipStream;

class ShareController extends Controller
{
    protected ShareService $shareService;
    protected AuditService $auditService;
    protected NotificationService $notifications;

    public function __construct(
        ShareService $shareService,
        AuditService $auditService,
        NotificationService $notifications
    ) {
        $this->shareService = $shareService;
        $this->auditService = $auditService;
        $this->notifications = $notifications;
    }

    /**
     * Afficher les partages d'un projet
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return redirect()->route('team.index', ['create' => 1])
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
            'client_id' => [
                'nullable',
                Rule::exists('clients', 'id')->where(
                    fn ($query) => $query->where('team_id', $project->team_id)
                ),
            ],
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

        $password = filled($request->input('password')) ? $request->input('password') : null;

        // Un lien privé sans mot de passe serait inaccessible : on refuse la création.
        if ($password === null && ! $request->boolean('is_public')) {
            throw ValidationException::withMessages([
                'password' => 'Définissez un mot de passe ou activez l’accès public.',
            ]);
        }

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
                // Un lien protégé par mot de passe est toujours privé.
                'is_public' => $password === null,
                'can_download' => $request->boolean('can_download', true),
                'can_comment' => $request->boolean('can_comment', true),
                'can_favorite' => $request->boolean('can_favorite', true),
                'expires_in_days' => $request->input('expires_in_days', 30),
                'max_views' => $request->input('max_views'),
                'password' => $password,
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

        $data = $request->validate([
            'is_public' => 'boolean',
            'can_download' => 'boolean',
            'can_comment' => 'boolean',
            'can_favorite' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
            'max_views' => 'nullable|integer|min:1',
            'password' => 'nullable|string|min:4|max:20',
        ]);

        if (filled($data['password'] ?? null)) {
            $data['is_public'] = false;
        }

        $access->update($data);

        return back()->with('success', 'Partage mis à jour avec succès !');
    }

    /**
     * Afficher la galerie publique
     */
    public function publicGallery($token)
    {
        // `owner_id` est indispensable : `shareViewed()` en déduit le
        // destinataire de la notification.
        $access = ProjectAccess::with('project:id,owner_id,title,description,client_name')
            ->where('access_token', $token)
            ->firstOrFail();

        $project = $access->project;

        // Vérifier si l'accès est expiré ou a atteint sa limite de vues.
        if (! $access->isValid()) {
            return Inertia::render(
                $access->isExpired() ? 'Gallery/Expired' : 'Gallery/LimitReached',
                ['projectTitle' => $project?->title]
            );
        }

        // Vérifier si un mot de passe est requis (sans consommer de vue).
        if ($this->requiresAuthentication($access) && ! $this->isGalleryAuthenticated($access)) {
            return Inertia::render('Gallery/Authenticate', [
                'token' => $token,
                'access' => [
                    'id' => $access->id,
                    'project' => ['title' => $project?->title],
                ],
            ]);
        }

        // Incrémenter le compteur de vues uniquement à l'affichage réel.
        $isFirstView = (int) $access->view_count === 0;

        $access->increment('view_count');
        $access->update(['last_accessed_at' => now()]);

        if ($isFirstView) {
            $this->notifications->shareViewed($access);
        }

        return Inertia::render('Gallery/Show', [
            // Ne jamais exposer le mot de passe ou le token complet du modèle.
            'access' => [
                'id' => $access->id,
                'access_token' => $access->access_token,
                'is_public' => $access->is_public,
                'view_count' => $access->view_count,
                'expires_at' => $access->expires_at?->toIso8601String(),
            ],
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

        if (! $access->isValid()) {
            return redirect()->route('public.gallery', $token);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'password' => 'required|string',
        ]);

        if (! $this->requiresAuthentication($access)) {
            return redirect()->route('public.gallery', $token);
        }

        if (! hash_equals((string) $access->password, (string) $request->input('password'))) {
            return back()->withErrors(['password' => 'Mot de passe incorrect.']);
        }

        session(['gallery_authenticated_' . $access->id => true]);

        // Log l'accès
        $this->auditService->log(
            null,
            'authenticate',
            $access,
            ['visitor_name' => $request->input('name'), 'visitor_email' => $request->input('email')]
        );

        return redirect()->route('public.gallery', $token);
    }

    /**
     * Commenter dans la galerie
     */
    public function comment(Request $request, $token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        $this->ensureGalleryAccess($access);

        if (! $access->can_comment) {
            return response()->json(['error' => 'Les commentaires sont désactivés.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'content' => 'required|string|max:1000',
            'file_id' => [
                'nullable',
                Rule::exists('files', 'id')->where(
                    fn ($query) => $query->where('project_id', $access->project_id)
                ),
            ],
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

        // Prévenir le propriétaire et les membres du projet.
        $this->notifications->commentReceived(
            $access->project,
            $request->name,
            $request->email,
            $comment->file,
            $access->id,
        );

        return response()->json(['success' => true, 'comment' => $comment]);
    }

    /**
     * Ajouter un favori
     */
    public function favoriteGallery(Request $request, $token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        $this->ensureGalleryAccess($access);

        if (! $access->can_favorite) {
            return response()->json(['error' => 'Les favoris sont désactivés.'], 403);
        }

        $request->validate([
            'file_id' => 'required|exists:files,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        $file = $access->project->files()->find($request->file_id);

        if (!$file) {
            return response()->json(['error' => 'Fichier introuvable.'], 404);
        }

        // Un même visiteur ne peut avoir qu'un favori par fichier :
        // un second clic retire le favori existant.
        $existing = $file->favorites()
            ->where('visitor_email', $request->email)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['success' => true, 'favorited' => false]);
        }

        $favorite = $file->favorites()->create([
            'visitor_email' => $request->email,
            'metadata' => [
                'name' => $request->name,
                'access_id' => $access->id,
            ],
        ]);

        $this->notifications->favoriteReceived(
            $access->project,
            $request->name,
            $request->email,
            $file,
            $access->id,
        );

        return response()->json([
            'success' => true,
            'favorited' => true,
            'favorite' => $favorite,
        ]);
    }

    /**
     * Récupérer les commentaires d'une galerie publique
     */
    public function getComments($token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        $this->ensureGalleryAccess($access);

        $comments = $access->project->comments()
            ->with('file')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'file_id' => $comment->file_id,
                    'visitor_name' => $comment->visitor_name,
                    'visitor_email' => $comment->visitor_email,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                ];
            });

        return response()->json($comments);
    }

    /**
     * Prévisualiser un fichier depuis la galerie publique
     */
    public function viewFile(Request $request, $token, File $file)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        if ($file->project_id !== $access->project_id) {
            abort(404);
        }

        $this->ensureGalleryAccess($access);

        // Les vignettes de la grille ne doivent pas gonfler le compteur de vues.
        if (! $request->boolean('thumb')) {
            $file->increment('view_count');
            $file->update(['last_accessed_at' => now()]);
        }

        if ($file->isImage() || $file->isVideo()) {
            return Storage::disk($file->disk)->response($file->path, $file->original_name);
        }

        return response()->json([
            'file' => $file,
            'type' => 'document',
            'download_url' => route('public.download', ['token' => $token, 'file' => $file->id]),
        ]);
    }

    /**
     * Télécharger un fichier depuis la galerie publique
     */
    public function downloadFile(Request $request, $token, File $file)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        if ($file->project_id !== $access->project_id) {
            abort(404);
        }

        $this->ensureGalleryAccess($access);

        if (! $access->can_download) {
            abort(403, 'Le téléchargement est désactivé pour cette galerie.');
        }

        // Une seule notification par lien de partage.
        $isFirstDownload = $access->first_downloaded_at === null;

        $file->increment('download_count');
        $file->update(['last_accessed_at' => now()]);

        if ($isFirstDownload) {
            $access->update(['first_downloaded_at' => now()]);
            $this->notifications->shareDownloaded($access, $file);
        }

        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }

    /**
     * Télécharger plusieurs fichiers de la galerie dans une archive ZIP.
     *
     * Options : `type` = all|images|videos|documents, et `ids` (liste
     * séparée par des virgules) pour ne télécharger que la sélection.
     */
    public function downloadFiles(Request $request, $token)
    {
        $access = ProjectAccess::where('access_token', $token)->firstOrFail();

        $this->ensureGalleryAccess($access);

        if (! $access->can_download) {
            abort(403, 'Le téléchargement est désactivé pour cette galerie.');
        }

        $type = (string) $request->query('type', 'all');
        $allowedTypes = ['all', FileCategory::IMAGES, FileCategory::VIDEOS, FileCategory::DOCUMENTS];

        if (! in_array($type, $allowedTypes, true)) {
            abort(422, 'Type de téléchargement invalide.');
        }

        $ids = collect($request->query('ids', []))
            ->flatMap(fn ($value) => explode(',', (string) $value))
            ->map(fn ($value) => (int) $value)
            ->filter()
            ->unique()
            ->values();

        $query = $access->project->files();

        // Respecter les dossiers autorisés sur le lien de partage.
        if ($access->allowed_folders) {
            $query->whereIn('folder_id', $access->allowed_folders);
        }

        if ($type !== 'all') {
            $query->ofCategory($type);
        }

        if ($ids->isNotEmpty()) {
            $query->whereIn('id', $ids);
        }

        $files = $query->orderBy('id')->get();

        if ($files->isEmpty()) {
            abort(404, 'Aucun fichier à télécharger.');
        }

        // Compteurs de téléchargement (une seule requête pour toute l'archive).
        $fileIds = $files->pluck('id');
        File::whereIn('id', $fileIds)->increment('download_count');
        File::whereIn('id', $fileIds)->update(['last_accessed_at' => now()]);

        // Une seule notification par lien de partage.
        if ($access->first_downloaded_at === null) {
            $access->update(['first_downloaded_at' => now()]);
            $this->notifications->shareDownloaded($access, $files->first());
        }

        $suffix = $ids->isNotEmpty()
            ? 'selection'
            : ($type === 'all' ? 'galerie' : $type);
        $slug = Str::slug($access->project->title ?: 'galerie');
        $archiveName = ($slug !== '' ? $slug : 'galerie') . '-' . $suffix . '.zip';

        return response()->streamDownload(function () use ($files) {
            // ZipStream écrit directement dans le flux : aucune archive
            // temporaire n'est créée sur le serveur.
            $zip = new ZipStream(sendHttpHeaders: false);
            $usedNames = [];

            foreach ($files as $file) {
                try {
                    $stream = Storage::disk($file->disk)->readStream($file->path);
                } catch (\Throwable) {
                    // Un fichier manquant ne doit pas casser toute l'archive.
                    continue;
                }

                if ($stream === false || $stream === null) {
                    continue;
                }

                $entryName = $this->uniqueArchiveName((string) $file->original_name, $usedNames);

                // Les médias sont déjà compressés : on les stocke tels quels.
                $compression = $file->isImage() || $file->isVideo()
                    ? CompressionMethod::STORE
                    : CompressionMethod::DEFLATE;

                $zip->addFileFromStream(
                    fileName: $entryName,
                    stream: $stream,
                    compressionMethod: $compression,
                    lastModificationDateTime: $file->updated_at,
                );

                if (is_resource($stream)) {
                    fclose($stream);
                }
            }

            $zip->finish();
        }, $archiveName, [
            'Content-Type' => 'application/x-zip',
        ]);
    }

    /**
     * Génère un nom d'entrée unique dans l'archive (les doublons sont
     * suffixés « (2) », « (3) », …).
     */
    private function uniqueArchiveName(string $name, array &$used): string
    {
        $name = trim(str_replace(['/', '\\'], '-', $name));

        if ($name === '') {
            $name = 'fichier';
        }

        $key = mb_strtolower($name);

        if (! isset($used[$key])) {
            $used[$key] = 1;

            return $name;
        }

        $info = pathinfo($name);
        $base = $info['filename'] !== '' ? $info['filename'] : 'fichier';
        $extension = isset($info['extension']) && $info['extension'] !== ''
            ? '.' . $info['extension']
            : '';

        do {
            $used[$key]++;
            $candidate = $base . ' (' . $used[$key] . ')' . $extension;
            $candidateKey = mb_strtolower($candidate);
        } while (isset($used[$candidateKey]));

        $used[$candidateKey] = 1;

        return $candidate;
    }

    /**
     * Un accès nécessite une authentification dès qu'un mot de passe est défini.
     */
    private function requiresAuthentication(ProjectAccess $access): bool
    {
        return filled($access->password);
    }

    /**
     * Indique si le visiteur a déjà validé le mot de passe de cette galerie.
     */
    private function isGalleryAuthenticated(ProjectAccess $access): bool
    {
        return (bool) session('gallery_authenticated_' . $access->id);
    }

    /**
     * Vérifie qu'un accès est valide et authentifié pour les actions publiques.
     */
    private function ensureGalleryAccess(ProjectAccess $access): void
    {
        if (! $access->isValid()) {
            abort(403, 'Cet accès a expiré ou a atteint sa limite de vues.');
        }

        if ($this->requiresAuthentication($access) && ! $this->isGalleryAuthenticated($access)) {
            abort(403, 'Authentification requise pour accéder à cette galerie.');
        }
    }
}
