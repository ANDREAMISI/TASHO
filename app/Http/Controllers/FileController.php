<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use App\Models\Project;
use App\Services\AuditService;
use App\Services\FileService;
use App\Support\FileCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
     * Servir le contenu d'un fichier en lecture (images, vidéos, PDF…).
     *
     * Passe par une route authentifiée : le disque `local` n'est pas exposé
     * publiquement. La réponse gère les requêtes Range (lecture vidéo).
     */
    public function stream(File $file)
    {
        Gate::authorize('view', $file);

        $disk = Storage::disk($file->disk);

        if (! $disk->exists($file->path)) {
            abort(404, 'Fichier introuvable sur le disque.');
        }

        $headers = [
            'Content-Type' => $file->mime_type ?: 'application/octet-stream',
            'Cache-Control' => 'private, max-age=3600',
        ];

        if ($file->disk === 'local') {
            return response()->file($disk->path($file->path), $headers);
        }

        return $disk->response($file->path, $file->original_name, $headers);
    }

    /**
     * Uploader un fichier
     */
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'project_id' => 'required|exists:projects,id',
                'folder_id' => 'nullable|exists:folders,id',
                'file' => 'required|file',
            ]);

            $project = Project::findOrFail($request->project_id);
            Gate::authorize('create', [File::class, $project]);

            $folderId = $this->resolveFolderId($request, $project);

            if ($request->filled('folder_id') && ! $folderId) {
                return $this->uploadError($request, 'Dossier invalide pour ce projet.', 422);
            }

            $uploadedFile = $request->file('file');

            // Vérifier le type de fichier
            if (! $this->isAllowedFileType($uploadedFile)) {
                return $this->uploadError($request, 'Ce type de fichier n\'est pas autorisé.', 422);
            }

            $file = $this->fileService->uploadFile(
                $uploadedFile,
                $project,
                $folderId,
                auth()->user()
            );

            Log::info('Fichier uploadé avec succès', ['file_id' => $file->id]);

            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Fichier uploadé avec succès !',
                    'file_id' => $file->id,
                ]);
            }

            return back()->with('success', 'Fichier uploadé avec succès !');
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'upload:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return $this->uploadError($request, 'Erreur: ' . $e->getMessage(), 500);
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

            $folderId = $this->resolveFolderId($request, $project);

            if ($request->filled('folder_id') && ! $folderId) {
                return response()->json(['message' => 'Dossier invalide pour ce projet.'], 422);
            }

            $uploadId = preg_replace('/[^A-Za-z0-9_-]/', '_', $request->upload_id);
            $tempDirectory = storage_path('app/tmp/uploads/' . $uploadId);

            if (! is_dir($tempDirectory)) {
                mkdir($tempDirectory, 0755, true);
            }

            $chunkFile = $request->file('chunk');
            $chunkFile->move($tempDirectory, $request->chunk_index . '.part');

            $chunkIndex = (int) $request->chunk_index;
            $chunkCount = (int) $request->chunk_count;

            if ($chunkIndex + 1 === $chunkCount) {
                Log::info('Assemblage des chunks démarré', [
                    'upload_id' => $uploadId,
                    'chunk_count' => $chunkCount,
                ]);

                $finalName = pathinfo($request->file_name, PATHINFO_FILENAME);
                $extension = pathinfo($request->file_name, PATHINFO_EXTENSION);
                $slug = Str::slug($finalName) . '-' . Str::random(8);
                $fileName = $slug . ($extension ? '.' . $extension : '');
                $relativePath = 'projects/' . $project->id . '/' . date('Y/m/d') . '/' . $fileName;
                $fullPath = Storage::disk('local')->path($relativePath);

                if (! is_dir(dirname($fullPath))) {
                    mkdir(dirname($fullPath), 0755, true);
                }

                $outputHandle = fopen($fullPath, 'ab');

                for ($i = 0; $i < $chunkCount; $i++) {
                    $partPath = $tempDirectory . '/' . $i . '.part';

                    if (! file_exists($partPath)) {
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
                    'folder_id' => $folderId,
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

                for ($i = 0; $i < $chunkCount; $i++) {
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

        $disk = Storage::disk($file->disk);

        if (! $disk->exists($file->path)) {
            abort(404, 'Fichier introuvable sur le disque.');
        }

        $file->increment('download_count');
        $file->update(['last_accessed_at' => now()]);

        return $disk->download($file->path, $file->original_name);
    }

    /**
     * Prévisualiser un fichier
     */
    public function preview(File $file)
    {
        Gate::authorize('view', $file);

        $file->increment('view_count');
        $file->update(['last_accessed_at' => now()]);

        return response()->json([
            'id' => $file->id,
            'name' => $file->original_name,
            'size' => (int) $file->size,
            'human_size' => $file->getHumanSize(),
            'mime_type' => $file->mime_type,
            'category' => FileCategory::for($file->mime_type),
            'category_label' => FileCategory::label($file->mime_type),
            'is_image' => $file->isImage(),
            'is_video' => $file->isVideo(),
            'is_audio' => $file->isAudio(),
            'is_pdf' => $file->isPdf(),
            'is_document' => $file->isDocument(),
            'is_previewable' => $file->isPreviewable(),
            'stream_url' => route('files.stream', $file),
            'download_url' => route('files.download', $file),
            'download_count' => (int) $file->download_count,
            'view_count' => (int) $file->view_count,
            'created_at' => $file->created_at?->toIso8601String(),
        ]);
    }

    /**
     * Renommer un fichier ou le déplacer dans un dossier.
     */
    public function update(Request $request, File $file)
    {
        Gate::authorize('update', $file);

        $request->validate([
            'name' => 'required|string|max:255',
            'folder_id' => 'nullable|exists:folders,id',
        ]);

        // Sans `folder_id` dans la requête, le fichier reste dans son dossier.
        $folderId = $file->folder_id;

        if ($request->has('folder_id')) {
            $folderId = $request->filled('folder_id')
                ? $this->resolveFolderId($request, $file->project)
                : null;

            if ($request->filled('folder_id') && ! $folderId) {
                return back()->withErrors(['name' => 'Dossier invalide pour ce projet.']);
            }
        }

        $fileName = trim((string) $request->name);
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);

        if ($extension === '' && $file->extension) {
            $fileName .= '.' . $file->extension;
        }

        $file->update([
            'name' => pathinfo($fileName, PATHINFO_FILENAME),
            'original_name' => $fileName,
            'folder_id' => $folderId,
        ]);

        return back()->with('success', 'Fichier mis à jour avec succès !');
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
     * Vérifier que le dossier ciblé appartient bien au projet.
     */
    private function resolveFolderId(Request $request, Project $project): ?int
    {
        if (! $request->filled('folder_id')) {
            return null;
        }

        $folder = Folder::where('project_id', $project->id)->find($request->folder_id);

        return $folder?->id;
    }

    /**
     * Réponse d'erreur d'upload (JSON ou redirection).
     */
    private function uploadError(Request $request, string $message, int $status)
    {
        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['message' => $message], $status);
        }

        return back()->withErrors(['file' => $message]);
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
        $isAllowed = str_starts_with($mimeType, 'video/')
            || str_starts_with($mimeType, 'audio/')
            || in_array($mimeType, $allowedTypes);

        return $isAllowed;
    }
}
