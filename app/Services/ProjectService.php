<?php

namespace App\Services;

use App\Models\AccessLog;
use App\Models\File;
use App\Models\Folder;
use App\Models\Project;
use App\Models\ProjectAccess;
use App\Models\Team;
use App\Models\User;
use App\Support\FileCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ProjectService
{
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
     * Créer un nouveau projet
     */
    public function createProject(Team $team, User $owner, array $data): Project
    {
        $project = Project::create([
            'team_id' => $team->id,
            'owner_id' => $owner->id,
            'title' => $data['title'],
            'slug' => Str::slug($data['title']) . '-' . Str::random(6),
            'description' => $data['description'] ?? null,
            'client_name' => $data['client_name'] ?? null,
            'client_email' => $data['client_email'] ?? null,
            'status' => $data['status'] ?? 'draft',
            'priority' => $data['priority'] ?? 'medium',
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        return $project;
    }

    /**
     * Créer les dossiers par défaut d'un projet
     */
    public function createDefaultFolders(Project $project): void
    {
        $defaultFolders = ['Photos', 'Vidéos', 'Documents', 'Export'];

        foreach ($defaultFolders as $folderName) {
            Folder::create([
                'project_id' => $project->id,
                'created_by' => $project->owner_id,
                'name' => $folderName,
                'path' => '/' . Str::slug($folderName),
                'slug' => Str::slug($folderName) . '-' . Str::random(6),
            ]);
        }
    }

    /**
     * Créer un dossier
     */
    public function createFolder(Project $project, string $name, ?int $parentId, User $user): Folder
    {
        $parent = $parentId ? Folder::where('project_id', $project->id)->find($parentId) : null;
        $path = $parent ? $parent->path . '/' . Str::slug($name) : '/' . Str::slug($name);

        return Folder::create([
            'project_id' => $project->id,
            'parent_id' => $parent?->id,
            'created_by' => $user->id,
            'name' => $name,
            'path' => $path,
            'slug' => Str::slug($name) . '-' . Str::random(6),
        ]);
    }

    /**
     * Compteurs de l'en-tête de la liste des projets (toute l'équipe).
     *
     * @return array<string, int>
     */
    public function getIndexSummary(Team $team): array
    {
        $projectIds = $team->projects()->pluck('id');

        $statusCounts = Project::query()
            ->where('team_id', $team->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $fileTotals = File::query()
            ->whereIn('project_id', $projectIds)
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(size), 0) as weight')
            ->first();

        return [
            'projects' => (int) $statusCounts->sum(),
            'active' => (int) ($statusCounts['active'] ?? 0),
            'completed' => (int) ($statusCounts['completed'] ?? 0),
            'draft' => (int) ($statusCounts['draft'] ?? 0),
            'archived' => (int) ($statusCounts['archived'] ?? 0),
            'files' => (int) ($fileTotals->total ?? 0),
            'storage' => (int) ($fileTotals->weight ?? 0),
            'folders' => Folder::whereIn('project_id', $projectIds)->count(),
            'clients' => $team->clients()->count(),
            'shares' => ProjectAccess::whereIn('project_id', $projectIds)->count(),
        ];
    }

    /**
     * Fichiers d'un projet, filtrés et paginés.
     *
     * Navigation par dossiers : à la racine, seuls les fichiers sans dossier
     * sont affichés. Une recherche élargit volontairement la portée à tout
     * le projet.
     */
    public function getFiles(Project $project, array $filters = []): LengthAwarePaginator
    {
        $folderId = $filters['folder_id'] ?? null;
        $category = $filters['category'] ?? null;
        $search = trim((string) ($filters['search'] ?? ''));
        $sort = $filters['sort'] ?? 'recent';
        $favorite = (bool) ($filters['favorite'] ?? false);
        $userId = auth()->id();

        $query = File::query()
            ->where('project_id', $project->id)
            ->with(['user:id,name', 'folder:id,name'])
            ->withExists(['favorites as is_favorited' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }]);

        // Hors recherche, on reste dans le dossier courant.
        if ($search === '') {
            if ($folderId) {
                $query->where('folder_id', $folderId);
            } else {
                $query->whereNull('folder_id');
            }
        }

        if ($category && FileCategory::isKnown($category)) {
            $query->ofCategory($category);
        }

        if ($favorite) {
            $query->favoritedBy($userId);
        }

        if ($search !== '') {
            $query->search($search);
        }

        match ($sort) {
            'name' => $query->orderBy('original_name'),
            'size' => $query->orderByDesc('size'),
            'oldest' => $query->orderBy('created_at'),
            default => $query->orderByDesc('created_at'),
        };

        return $query
            ->paginate(24)
            ->withQueryString()
            ->through(fn (File $file) => $this->mapFile($file, $project));
    }

    /**
     * Sous-dossiers d'un dossier (ou racine du projet).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getFolders(Project $project, ?int $parentId = null): array
    {
        return Folder::query()
            ->where('project_id', $project->id)
            ->where('parent_id', $parentId)
            ->withCount(['files', 'children'])
            ->withSum('files as files_size', 'size')
            ->orderBy('name')
            ->get()
            ->map(fn (Folder $folder) => [
                'id' => $folder->id,
                'name' => $folder->name,
                'parent_id' => $folder->parent_id,
                'files_count' => (int) $folder->files_count,
                'children_count' => (int) $folder->children_count,
                'files_size' => (int) ($folder->files_size ?? 0),
            ])
            ->all();
    }

    /**
     * Liste plate des dossiers du projet (sélecteur d'upload).
     *
     * @return array<int, array{id: int, name: string, label: string, depth: int}>
     */
    public function getFolderOptions(Project $project): array
    {
        $folders = Folder::where('project_id', $project->id)
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id']);

        $byParent = $folders->groupBy(fn (Folder $folder) => $folder->parent_id ?? 0);
        $options = [];

        $walk = function (int $parentId, int $depth) use (&$walk, &$options, $byParent) {
            foreach ($byParent->get($parentId, []) as $folder) {
                $options[] = [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'label' => str_repeat('— ', $depth) . $folder->name,
                    'depth' => $depth,
                ];

                $walk($folder->id, $depth + 1);
            }
        };

        $walk(0, 0);

        return $options;
    }

    /**
     * Arborescence complète des dossiers d'un projet (navigation latérale).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getFolderTree(Project $project): array
    {
        $folders = Folder::query()
            ->where('project_id', $project->id)
            ->withCount(['files', 'children'])
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id']);

        $byParent = $folders->groupBy(fn (Folder $folder) => $folder->parent_id ?? 0);

        $build = function (int $parentId, int $depth = 0) use (&$build, $byParent): array {
            if ($depth > 20) {
                return [];
            }

            $nodes = [];

            foreach ($byParent->get($parentId, []) as $folder) {
                $nodes[] = [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'files_count' => (int) $folder->files_count,
                    'children_count' => (int) $folder->children_count,
                    'children' => $build($folder->id, $depth + 1),
                ];
            }

            return $nodes;
        };

        return $build(0);
    }

    /**
     * Fil d'Ariane d'un dossier (racine → dossier courant).
     *
     * @return array<int, array{id: int, name: string}>
     */
    public function getBreadcrumb(?Folder $folder): array
    {
        $breadcrumb = [];
        $current = $folder;
        $guard = 0;

        while ($current && $guard < 20) {
            array_unshift($breadcrumb, [
                'id' => $current->id,
                'name' => $current->name,
            ]);

            $current = $current->parent;
            $guard++;
        }

        return $breadcrumb;
    }

    /**
     * Statistiques complètes d'un projet (agrégats SQL, pas de collection).
     *
     * @return array<string, mixed>
     */
    public function getProjectStats(Project $project): array
    {
        $totalFiles = File::where('project_id', $project->id)->count();
        $totalSize = (int) File::where('project_id', $project->id)->sum('size');

        $rows = File::query()
            ->where('project_id', $project->id)
            ->selectRaw(FileCategory::expression() . ' as category, COUNT(*) as total, COALESCE(SUM(size), 0) as weight')
            ->groupBy('category')
            ->get()
            ->keyBy('category');

        $categories = [];

        foreach (FileCategory::LABELS as $key => $label) {
            $row = $rows->get($key);
            $weight = (int) ($row->weight ?? 0);

            $categories[] = [
                'key' => $key,
                'label' => $label,
                'count' => (int) ($row->total ?? 0),
                'size' => $weight,
                'percentage' => $totalSize > 0 ? round(($weight / $totalSize) * 100, 1) : 0.0,
            ];
        }

        $lastUpload = File::where('project_id', $project->id)->max('created_at');

        return [
            'total_files' => $totalFiles,
            'total_size' => $totalSize,
            'human_size' => $this->formatSize($totalSize),
            'categories' => $categories,
            'folders_count' => Folder::where('project_id', $project->id)->count(),
            'members_count' => $project->members()->count(),
            'comments_count' => $project->comments()->count(),
            'accesses_count' => $project->accesses()->count(),
            'logs_count' => AccessLog::where('project_id', $project->id)->count(),
            'views_count' => AccessLog::where('project_id', $project->id)->where('action', 'view')->count(),
            'last_upload_at' => $lastUpload ? \Illuminate\Support\Carbon::parse($lastUpload)->toIso8601String() : null,
        ];
    }

    /**
     * Derniers fichiers déposés dans le projet.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRecentFiles(Project $project, int $limit = 6): array
    {
        return File::query()
            ->where('project_id', $project->id)
            ->with(['user:id,name', 'folder:id,name'])
            ->withExists(['favorites as is_favorited' => function ($query) {
                $query->where('user_id', auth()->id());
            }])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (File $file) => $this->mapFile($file, $project))
            ->all();
    }

    /**
     * Dernières actions enregistrées sur le projet.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRecentLogs(Project $project, int $limit = 8): array
    {
        return AccessLog::query()
            ->where('project_id', $project->id)
            ->with(['user:id,name', 'file:id,original_name', 'client:id,name'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (AccessLog $log) => $this->mapActivity($log))
            ->all();
    }

    /**
     * Répartition des actions du projet (onglet Activité).
     *
     * @return array{total: int, by_action: array<int, array{action: string, label: string, count: int}>}
     */
    public function getActivitySummary(Project $project): array
    {
        $counts = AccessLog::query()
            ->where('project_id', $project->id)
            ->selectRaw('action, COUNT(*) as total')
            ->groupBy('action')
            ->pluck('total', 'action');

        $byAction = $counts
            ->map(fn ($total, $action) => [
                'action' => $action,
                'label' => $this->actionLabel($action),
                'count' => (int) $total,
            ])
            ->sortByDesc('count')
            ->values()
            ->all();

        return [
            'total' => (int) $counts->sum(),
            'by_action' => $byAction,
        ];
    }

    /**
     * Représentation d'un journal d'activité pour l'interface.
     *
     * @return array<string, mixed>
     */
    public function mapActivity(AccessLog $log): array
    {
        return [
            'id' => $log->id,
            'action' => $log->action,
            'label' => $this->actionLabel($log->action),
            'actor' => $log->user?->name ?? $log->visitor_name ?? 'Visiteur anonyme',
            'actor_email' => $log->user?->email ?? $log->visitor_email,
            'file' => $log->file?->original_name,
            'file_id' => $log->file_id,
            'client' => $log->client?->name,
            'created_at' => $log->created_at?->toIso8601String(),
            'time_ago' => $log->created_at?->diffForHumans(),
        ];
    }

    /**
     * Représentation d'un fichier pour l'interface.
     *
     * @return array<string, mixed>
     */
    private function mapFile(File $file, Project $project): array
    {
        $user = auth()->user();
        $canDelete = $file->user_id === $user?->id
            || $project->owner_id === $user?->id
            || $user?->email === 'admin@tasho.com';

        return [
            'id' => $file->id,
            'name' => $file->name,
            'original_name' => $file->original_name,
            'slug' => $file->slug,
            'size' => (int) $file->size,
            'human_size' => $file->getHumanSize(),
            'mime_type' => $file->mime_type,
            'extension' => $file->extension,
            'category' => $file->category(),
            'category_label' => FileCategory::label($file->mime_type),
            'is_image' => $file->isImage(),
            'is_video' => $file->isVideo(),
            'is_audio' => $file->isAudio(),
            'is_pdf' => $file->isPdf(),
            'is_document' => $file->isDocument(),
            'is_previewable' => $file->isPreviewable(),
            'is_favorited' => (bool) $file->is_favorited,
            'can_delete' => $canDelete,
            'user' => $file->user ? ['id' => $file->user->id, 'name' => $file->user->name] : null,
            'folder' => $file->folder ? ['id' => $file->folder->id, 'name' => $file->folder->name] : null,
            'download_count' => (int) $file->download_count,
            'view_count' => (int) $file->view_count,
            'created_at' => $file->created_at?->toIso8601String(),
            'updated_at' => $file->updated_at?->toIso8601String(),
        ];
    }

    private function actionLabel(?string $action): string
    {
        return self::ACTION_LABELS[$action] ?? ucfirst((string) $action);
    }

    /**
     * Formater la taille en format lisible
     */
    private function formatSize($bytes): string
    {
        $bytes = max((int) $bytes, 0);
        $units = ['o', 'Ko', 'Mo', 'Go', 'To'];
        $index = 0;

        while ($bytes >= 1024 && $index < count($units) - 1) {
            $bytes /= 1024;
            $index++;
        }

        $value = round($bytes, $index === 0 ? 0 : 1);

        return str_replace('.', ',', (string) $value) . ' ' . $units[$index];
    }

    /**
     * Obtenir la structure des dossiers d'un projet
     */
    public function getFolderStructure(Project $project): array
    {
        $folders = Folder::where('project_id', $project->id)
            ->with(['files', 'children'])
            ->get();

        return $this->buildFolderTree($folders, null);
    }

    /**
     * Construire l'arborescence des dossiers
     */
    private function buildFolderTree($folders, $parentId): array
    {
        $result = [];

        foreach ($folders as $folder) {
            if ($folder->parent_id === $parentId) {
                $children = $this->buildFolderTree($folders, $folder->id);

                $result[] = [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'path' => $folder->path,
                    'files' => $folder->files,
                    'children' => $children,
                    'files_count' => $folder->files->count(),
                    'children_count' => count($children),
                ];
            }
        }

        return $result;
    }

    /**
     * Vérifier si un utilisateur peut accéder à un projet
     */
    public function canAccessProject(Project $project, User $user): bool
    {
        // Le propriétaire a toujours accès
        if ($project->owner_id === $user->id) {
            return true;
        }

        // Vérifier si l'utilisateur est membre de l'équipe du projet
        if (! $project->team->members()->where('user_id', $user->id)->exists()) {
            return false;
        }

        // Vérifier si l'utilisateur est membre du projet
        return $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Dupliquer un projet
     */
    public function duplicateProject(Project $project, User $user): Project
    {
        $newProject = $project->replicate();
        $newProject->title = $project->title . ' (copie)';
        $newProject->slug = Str::slug($newProject->title) . '-' . Str::random(6);
        $newProject->owner_id = $user->id;
        $newProject->status = 'draft';
        $newProject->save();

        // Dupliquer les dossiers
        foreach ($project->folders as $folder) {
            $newFolder = $folder->replicate();
            $newFolder->project_id = $newProject->id;
            $newFolder->slug = Str::slug($folder->name) . '-' . Str::random(6);
            $newFolder->save();
        }

        return $newProject;
    }
}
