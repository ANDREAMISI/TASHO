<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectAccess;
use App\Models\Client;
use App\Models\File;
use App\Models\Folder;
use Illuminate\Support\Str;

class ShareService
{
    /**
     * Créer un accès pour un projet
     */
    public function createAccess(Project $project, ?Client $client, array $options): ProjectAccess
    {
        $access = ProjectAccess::create([
            'project_id' => $project->id,
            'client_id' => $client?->id,
            'access_token' => Str::random(64),
            'is_public' => $options['is_public'] ?? false,
            'can_download' => $options['can_download'] ?? true,
            'can_comment' => $options['can_comment'] ?? true,
            'can_favorite' => $options['can_favorite'] ?? true,
            'password' => $options['password'] ?? null,
            'expires_at' => $options['expires_in_days'] 
                ? now()->addDays($options['expires_in_days']) 
                : null,
            'max_views' => $options['max_views'] ?? null,
        ]);

        return $access;
    }

    /**
     * Obtenir les fichiers accessibles
     */
    public function getAccessibleFiles(ProjectAccess $access)
    {
        $files = $access->project->files;

        if ($access->allowed_folders) {
            $files = $files->whereIn('folder_id', $access->allowed_folders);
        }

        return $files->map(function ($file) {
            return [
                'id' => $file->id,
                'name' => $file->name,
                'original_name' => $file->original_name,
                'size' => $file->size,
                'human_size' => $file->getHumanSize(),
                'mime_type' => $file->mime_type,
                'extension' => $file->extension,
                'is_image' => $file->isImage(),
                'is_video' => $file->isVideo(),
                'is_document' => $file->isDocument(),
                'created_at' => $file->created_at,
                'folder_id' => $file->folder_id,
            ];
        });
    }

    /**
     * Obtenir les dossiers accessibles
     */
    public function getAccessibleFolders(ProjectAccess $access)
    {
        $folders = $access->project->folders;

        if ($access->allowed_folders) {
            $folders = $folders->whereIn('id', $access->allowed_folders);
        }

        return $folders->map(function ($folder) {
            return [
                'id' => $folder->id,
                'name' => $folder->name,
                'path' => $folder->path,
                'files_count' => $folder->files->count(),
            ];
        });
    }

    /**
     * Vérifier si un accès est valide
     */
    public function isValidAccess(ProjectAccess $access): bool
    {
        // Vérifier l'expiration
        if ($access->expires_at && $access->expires_at->isPast()) {
            return false;
        }

        // Vérifier le nombre de vues
        if ($access->max_views && $access->view_count >= $access->max_views) {
            return false;
        }

        return true;
    }

    /**
     * Générer un lien de partage
     */
    public function generateShareLink(ProjectAccess $access): string
    {
        return route('public.gallery', $access->access_token);
    }

    /**
     * Envoyer un email de partage
     */
    public function sendShareEmail(ProjectAccess $access, string $email, ?string $message = null): void
    {
        // TODO: Implémenter l'envoi d'email
        // Mail::to($email)->send(new ShareProjectMail($access, $message));
    }
}