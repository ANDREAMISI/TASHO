<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Project;
use App\Models\Folder;
use App\Models\AccessLog;
use App\Services\FileService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FileController extends Controller
{
    protected FileService $fileService;
    protected AuditService $auditService;

    public function __construct(FileService $fileService, AuditService $auditService)
    {
        $this->fileService = $fileService;
        $this->auditService = $auditService;
    }

    /**
     * Afficher les fichiers d'un projet
     */
    public function index(Request $request, Project $project)
    {
        Gate::authorize('view', $project);

        $query = File::where('project_id', $project->id);

        // Filtrer par dossier
        if ($request->filled('folder_id')) {
            $query->where('folder_id', $request->folder_id);
        }

        // Filtrer par type
        if ($request->filled('type')) {
            switch ($request->type) {
                case 'image':
                    $query->where('mime_type', 'LIKE', 'image/%');
                    break;
                case 'video':
                    $query->where('mime_type', 'LIKE', 'video/%');
                    break;
                case 'document':
                    $query->whereIn('mime_type', [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'text/plain',
                    ]);
                    break;
            }
        }

        // Recherche
        if ($request->filled('search')) {
            $query->where('name', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('original_name', 'LIKE', '%' . $request->search . '%');
        }

        $files = $query->with(['user', 'folder'])
            ->orderBy('created_at', 'desc')
            ->paginate(24)
            ->through(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'original_name' => $file->original_name,
                    'slug' => $file->slug,
                    'size' => $file->size,
                    'human_size' => $file->getHumanSize(),
                    'mime_type' => $file->mime_type,
                    'extension' => $file->extension,
                    'path' => $file->path,
                    'is_public' => $file->is_public,
                    'user' => $file->user,
                    'folder' => $file->folder,
                    'is_image' => $file->isImage(),
                    'is_video' => $file->isVideo(),
                    'is_document' => $file->isDocument(),
                    'download_count' => $file->download_count,
                    'view_count' => $file->view_count,
                    'created_at' => $file->created_at,
                    'updated_at' => $file->updated_at,
                ];
            });

        // Récupérer la structure des dossiers
        $folders = Folder::where('project_id', $project->id)
            ->whereNull('parent_id')
            ->with(['children', 'files'])
            ->get();

        $currentFolder = null;
        if ($request->filled('folder_id')) {
            $currentFolder = Folder::find($request->folder_id);
        }

        $stats = [
            'total_files' => File::where('project_id', $project->id)->count(),
            'total_size' => File::where('project_id', $project->id)->sum('size'),
            'images' => File::where('project_id', $project->id)->where('mime_type', 'LIKE', 'image/%')->count(),
            'videos' => File::where('project_id', $project->id)->where('mime_type', 'LIKE', 'video/%')->count(),
            'documents' => File::where('project_id', $project->id)->whereIn('mime_type', [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ])->count(),
        ];

        return Inertia::render('File/Index', [
            'project' => $project,
            'files' => $files,
            'folders' => $folders,
            'currentFolder' => $currentFolder,
            'filters' => $request->only(['folder_id', 'type', 'search']),
            'stats' => $stats,
        ]);
    }

    /**
     * Uploader un fichier
     */
    public function upload(Request $request)
    {
        try {
            Log::info('=== UPLOAD DE FICHIER ===');
            Log::info('Données reçues:', $request->all());
            
            $request->validate([
                'project_id' => 'required|exists:projects,id',
                'folder_id' => 'nullable|exists:folders,id',
                'file' => 'required|file|max:5120', // 5GB max
            ]);

            Log::info('Validation réussie');

            $project = Project::findOrFail($request->project_id);
            Gate::authorize('create', [File::class, $project]);

            $uploadedFile = $request->file('file');
            
            Log::info('Fichier reçu:', [
                'name' => $uploadedFile->getClientOriginalName(),
                'size' => $uploadedFile->getSize(),
                'mime' => $uploadedFile->getMimeType(),
            ]);

            // Vérifier la taille
            $maxSize = $this->getMaxFileSize($project);
            if ($uploadedFile->getSize() > $maxSize) {
                Log::error('Fichier trop volumineux', ['size' => $uploadedFile->getSize(), 'max' => $maxSize]);
                return back()->withErrors([
                    'file' => 'Le fichier dépasse la taille maximale autorisée (' . ($maxSize / 1024 / 1024) . 'MB).',
                ]);
            }

            // Vérifier le type de fichier
            if (!$this->isAllowedFileType($uploadedFile)) {
                Log::error('Type de fichier non autorisé', ['mime' => $uploadedFile->getMimeType()]);
                return back()->withErrors([
                    'file' => 'Ce type de fichier n\'est pas autorisé.',
                ]);
            }

            // Créer le fichier
            $file = $this->fileService->uploadFile(
                $uploadedFile,
                $project,
                $request->folder_id,
                auth()->user()
            );

            Log::info('Fichier uploadé avec succès', ['file_id' => $file->id]);

            return back()->with('success', 'Fichier uploadé avec succès !');

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'upload:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['message' => 'Erreur: ' . $e->getMessage()]);
        }
    }

    /**
     * Télécharger un fichier
     */
    public function download(File $file)
    {
        Gate::authorize('download', $file);

        // Incrémenter le compteur de téléchargements
        $file->increment('download_count');
        $file->update(['last_accessed_at' => now()]);

        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }

    /**
     * Prévisualiser un fichier
     */
    public function preview(File $file)
    {
        Gate::authorize('view', $file);

        $file->increment('view_count');
        $file->update(['last_accessed_at' => now()]);

        if ($file->isImage()) {
            return response()->json([
                'url' => Storage::disk($file->disk)->url($file->path),
                'file' => $file,
            ]);
        }

        if ($file->isVideo()) {
            return response()->json([
                'url' => Storage::disk($file->disk)->url($file->path),
                'file' => $file,
                'type' => 'video',
            ]);
        }

        return response()->json([
            'file' => $file,
            'type' => 'document',
            'download_url' => route('files.download', $file),
        ]);
    }

    /**
     * Supprimer un fichier
     */
    public function destroy(File $file)
    {
        Gate::authorize('delete', $file);

        $this->fileService->deleteFile($file);

        return back()->with('success', 'Fichier supprimé avec succès !');
    }

    /**
     * Ajouter/Retirer des favoris
     */
    public function favorite(Request $request, File $file)
    {
        Gate::authorize('view', $file);

        $user = auth()->user();
        $isFavorited = $file->favorites()->where('user_id', $user->id)->exists();

        if ($isFavorited) {
            $file->favorites()->where('user_id', $user->id)->delete();
            $message = 'Retiré des favoris';
        } else {
            $file->favorites()->create([
                'user_id' => $user->id,
            ]);
            $message = 'Ajouté aux favoris';
        }

        return back()->with('success', $message);
    }

    /**
     * Obtenir la taille maximale autorisée
     */
    private function getMaxFileSize(Project $project): int
    {
        return 5368709120; // 5GB par défaut
    }

    /**
     * Vérifier si le type de fichier est autorisé
     */
    private function isAllowedFileType($file): bool
    {
        $allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'video/x-msvideo',    // AVI
            'video/x-matroska',   // MKV
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
        ];

        $mimeType = $file->getMimeType();
        Log::info('Vérification du type MIME:', ['mime' => $mimeType, 'allowed' => in_array($mimeType, $allowedTypes)]);

        return in_array($mimeType, $allowedTypes);
    }
}