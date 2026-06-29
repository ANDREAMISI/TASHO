<?php

namespace App\Services;

use App\Models\File;
use App\Models\Project;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class FileService
{
    /**
     * Uploader un fichier
     */
    public function uploadFile(UploadedFile $uploadedFile, Project $project, ?int $folderId, User $user): File
    {
        try {
            $originalName = $uploadedFile->getClientOriginalName();
            $extension = $uploadedFile->getClientOriginalExtension();
            $name = pathinfo($originalName, PATHINFO_FILENAME);
            
            // Générer un nom unique
            $slug = Str::slug($name) . '-' . Str::random(8);
            $fileName = $slug . '.' . $extension;
            
            // Créer le chemin
            $path = 'projects/' . $project->id . '/' . date('Y/m/d') . '/' . $fileName;
            
            Log::info('Upload de fichier:', [
                'original' => $originalName,
                'path' => $path,
                'size' => $uploadedFile->getSize()
            ]);
            
            // Uploader le fichier
            Storage::disk('local')->putFileAs(
                'projects/' . $project->id . '/' . date('Y/m/d'),
                $uploadedFile,
                $fileName
            );

            // Créer l'entrée en base de données
            $file = File::create([
                'project_id' => $project->id,
                'folder_id' => $folderId,
                'user_id' => $user->id,
                'name' => $name,
                'original_name' => $originalName,
                'slug' => $slug,
                'path' => $path,
                'disk' => 'local',
                'size' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType(),
                'extension' => $extension,
                'hash' => md5_file($uploadedFile->getRealPath()),
                'uploaded_at' => now(),
            ]);

            Log::info('Entrée DB créée:', ['file_id' => $file->id]);

            return $file;

        } catch (\Exception $e) {
            Log::error('Erreur dans FileService::uploadFile:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        }
    }

    /**
     * Supprimer un fichier
     */
    public function deleteFile(File $file): void
    {
        // Supprimer le fichier physique
        Storage::disk($file->disk)->delete($file->path);
        
        // Supprimer l'entrée en base de données
        $file->delete();
    }

    /**
     * Obtenir la structure des dossiers
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
                    'files_count' => $folder->files->count(),
                    'children' => $children,
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

        return [
            'total_files' => $files->count(),
            'total_size' => $totalSize,
            'human_size' => $this->formatSize($totalSize),
            'images' => $files->where('mime_type', 'LIKE', 'image/%')->count(),
            'videos' => $files->where('mime_type', 'LIKE', 'video/%')->count(),
            'documents' => $files->whereIn('mime_type', [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->count(),
            'folders_count' => $project->folders->count(),
        ];
    }

    /**
     * Formater la taille
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
     * Obtenir l'URL d'un fichier
     */
    public function getFileUrl(File $file): string
    {
        return Storage::disk($file->disk)->url($file->path);
    }

    /**
     * Vérifier si un fichier existe
     */
    public function fileExists(File $file): bool
    {
        return Storage::disk($file->disk)->exists($file->path);
    }

    /**
     * Dupliquer un fichier
     */
    public function duplicateFile(File $file, User $user, ?int $folderId = null): File
    {
        $newName = $file->name . ' (copie)';
        $newSlug = Str::slug($newName) . '-' . Str::random(8);
        $newPath = str_replace($file->slug, $newSlug, $file->path);

        // Copier le fichier physique
        Storage::disk($file->disk)->copy($file->path, $newPath);

        // Créer l'entrée en base de données
        return File::create([
            'project_id' => $file->project_id,
            'folder_id' => $folderId ?? $file->folder_id,
            'user_id' => $user->id,
            'name' => $newName,
            'original_name' => $file->original_name,
            'slug' => $newSlug,
            'path' => $newPath,
            'disk' => $file->disk,
            'size' => $file->size,
            'mime_type' => $file->mime_type,
            'extension' => $file->extension,
            'hash' => $file->hash,
            'uploaded_at' => now(),
        ]);
    }
}