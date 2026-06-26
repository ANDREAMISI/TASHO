<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Team;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Support\Str;

class ProjectService
{
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
        $parent = $parentId ? Folder::find($parentId) : null;
        $path = $parent ? $parent->path . '/' . Str::slug($name) : '/' . Str::slug($name);

        return Folder::create([
            'project_id' => $project->id,
            'parent_id' => $parentId,
            'created_by' => $user->id,
            'name' => $name,
            'path' => $path,
            'slug' => Str::slug($name) . '-' . Str::random(6),
        ]);
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
     * Obtenir les statistiques d'un projet
     */
    public function getProjectStats(Project $project): array
    {
        $files = $project->files;
        $totalSize = $files->sum('size');
        $fileTypes = [
            'images' => $files->where('mime_type', 'LIKE', 'image/%')->count(),
            'videos' => $files->where('mime_type', 'LIKE', 'video/%')->count(),
            'documents' => $files->whereIn('mime_type', [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->count(),
            'others' => $files->count() - $files->where('mime_type', 'LIKE', 'image/%')->count()
                - $files->where('mime_type', 'LIKE', 'video/%')->count()
                - $files->whereIn('mime_type', [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ])->count(),
        ];

        return [
            'total_files' => $files->count(),
            'total_size' => $totalSize,
            'human_size' => $this->formatSize($totalSize),
            'file_types' => $fileTypes,
            'folders_count' => $project->folders->count(),
            'members_count' => $project->members->count(),
            'comments_count' => $project->comments->count(),
            'views_count' => $project->logs->count(),
        ];
    }

    /**
     * Formater la taille en format lisible
     */
    private function formatSize($bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;

        while ($bytes > 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
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
        if (!$project->team->members()->where('user_id', $user->id)->exists()) {
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