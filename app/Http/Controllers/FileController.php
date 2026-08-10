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
use Illuminate\Support\Str;
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
                'file' => 'required|file',
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

            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['success' => true, 'message' => 'Fichier uploadé avec succès !']);
            }

            return back()->with('success', 'Fichier uploadé avec succès !');
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'upload:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($request->ajax() || $request->wantsJson()) {
                return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
            }

            return back()->withErrors(['message' => 'Erreur: ' . $e->getMessage()]);
        }
    }

    /**
     * Uploader un chunk de fichier
     */
    public function uploadChunk(Request $request)
    {
        try {
            $request->validate([
                'project_id' => 'required|exists:projects,id',
                'folder_id' => 'nullable|exists:folders,id',
                'upload_id' => 'required|string|max:255',
                'chunk_index' => 'required|integer|min:0',
                'chunk_count' => 'required|integer|min:1',
                'file_name' => 'required|string|max:255',
                'file_size' => 'required|integer|min:1',
                'mime_type' => 'required|string|max:255',
                'chunk' => 'required|file',
            ]);

            $project = Project::findOrFail($request->project_id);
            Gate::authorize('create', [File::class, $project]);

            $uploadId = preg_replace('/[^A-Za-z0-9_-]/', '_', $request->upload_id);
            $tempDirectory = storage_path('app/tmp/uploads/' . $uploadId);
            if (!is_dir($tempDirectory)) {
                mkdir($tempDirectory, 0755, true);
            }

            $chunkFile = $request->file('chunk');
            $chunkPath = $tempDirectory . '/' . $request->chunk_index . '.part';
            $chunkFile->move($tempDirectory, $request->chunk_index . '.part');

            Log::info('Chunk reçu', [
                'upload_id' => $uploadId,
                'chunk_index' => $request->chunk_index,
                'chunk_count' => $request->chunk_count,
                'file_name' => $request->file_name,
                'file_size' => $request->file_size,
                'mime_type' => $request->mime_type,
            ]);

            // Cast chunk indexes to int to avoid strict comparison issues with string values
            $chunkIndex = (int) $request->chunk_index;
            $chunkCount = (int) $request->chunk_count;

            if ($chunkIndex + 1 === $chunkCount) {
                Log::info('Assemblage des chunks démarré', ['upload_id' => $uploadId, 'chunk_count' => $chunkCount]);
                $finalName = pathinfo($request->file_name, PATHINFO_FILENAME);
                $extension = pathinfo($request->file_name, PATHINFO_EXTENSION);
                $slug = Str::slug($finalName) . '-' . Str::random(8);
                $fileName = $slug . ($extension ? '.' . $extension : '');
                $relativePath = 'projects/' . $project->id . '/' . date('Y/m/d') . '/' . $fileName;
                $fullPath = storage_path('app/' . $relativePath);

                if (!is_dir(dirname($fullPath))) {
                    mkdir(dirname($fullPath), 0755, true);
                }

                $outputHandle = fopen($fullPath, 'ab');
                for ($i = 0; $i < $chunkCount; $i++) {
                    $partPath = $tempDirectory . '/' . $i . '.part';
                    if (!file_exists($partPath)) {
                        fclose($outputHandle);
                        throw new \RuntimeException('Chunk manquant: ' . $i);
                    }
                    $inputHandle = fopen($partPath, 'rb');
                    stream_copy_to_stream($inputHandle, $outputHandle);
                    fclose($inputHandle);
                }
                fclose($outputHandle);

                $file = File::create([
                    'project_id' => $project->id,
                    'folder_id' => $request->folder_id,
                    'user_id' => auth()->id(),
                    'name' => $finalName,
                    'original_name' => $request->file_name,
                    'slug' => $slug,
                    'path' => $relativePath,
                    'disk' => 'local',
                    'size' => $request->file_size,
                    'mime_type' => $request->mime_type,
                    'extension' => $extension,
                    'hash' => null,
                    'uploaded_at' => now(),
                ]);

                for ($i = 0; $i < $request->chunk_count; $i++) {
                    @unlink($tempDirectory . '/' . $i . '.part');
                }
                @rmdir($tempDirectory);

                return response()->json([
                    'success' => true,
                    'message' => 'Upload terminé',
                    'file_id' => $file->id,
                ]);
            }

            return response()->json([
                'success' => true,
                'uploaded' => true,
                'chunk_index' => $request->chunk_index,
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur upload chunk:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Erreur durant l\'upload du chunk: ' . $e->getMessage()], 500);
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
        $isAllowed = str_starts_with($mimeType, 'video/') || in_array($mimeType, $allowedTypes);

        Log::info('Vérification du type MIME:', ['mime' => $mimeType, 'allowed' => $isAllowed]);

        return $isAllowed;
    }
}
