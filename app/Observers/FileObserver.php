<?php

namespace App\Observers;

use App\Models\File;
use App\Services\NotificationService;

class FileObserver
{
    public function __construct(private NotificationService $notifications)
    {
    }

    /**
     * Prévenir les membres du projet qu'un fichier vient d'être ajouté.
     *
     * L'observateur couvre les deux chemins d'upload (classique et par
     * chunks), qui créent tous les deux un modèle `File`.
     */
    public function created(File $file): void
    {
        $project = $file->project;

        if (! $project) {
            return;
        }

        $this->notifications->fileUploaded($file);
        $this->notifications->scanStorageForProject($project);
    }
}
