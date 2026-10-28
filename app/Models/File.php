<?php

namespace App\Models;

use App\Support\FileCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class File extends Model
{
    protected $fillable = [
        'project_id',
        'folder_id',
        'user_id',
        'name',
        'original_name',
        'slug',
        'path',
        'disk',
        'size',
        'mime_type',
        'extension',
        'hash',
        'is_public',
        'metadata',
        'uploaded_at',
        'last_accessed_at',
        'download_count',
        'view_count',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_public' => 'boolean',
        'uploaded_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'size' => 'integer',
        'download_count' => 'integer',
        'view_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($file) {
            if (empty($file->slug)) {
                $file->slug = Str::slug($file->name) . '-' . Str::random(8);
            }
        });
    }

    // ============================================================
    // RELATIONS
    // ============================================================

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }

    // ============================================================
    // SCOPES
    // ============================================================

    /**
     * Filtre par famille MIME (images, vidéos, documents…).
     */
    public function scopeOfCategory(Builder $query, string $category): Builder
    {
        if (! FileCategory::isKnown($category)) {
            return $query;
        }

        return $query->whereRaw(FileCategory::expression() . ' = ?', [$category]);
    }

    /**
     * Recherche sur le nom affiché et le nom d'origine.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        $like = '%' . $term . '%';

        return $query->where(function (Builder $query) use ($like) {
            $query->where('name', 'LIKE', $like)
                ->orWhere('original_name', 'LIKE', $like);
        });
    }

    /**
     * Fichiers mis en favori par un utilisateur.
     */
    public function scopeFavoritedBy(Builder $query, ?int $userId): Builder
    {
        if (! $userId) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas('favorites', function (Builder $query) use ($userId) {
            $query->where('user_id', $userId);
        });
    }

    // ============================================================
    // CATÉGORIE / TYPE
    // ============================================================

    public function category(): string
    {
        return FileCategory::for($this->mime_type);
    }

    public function isImage(): bool
    {
        return $this->category() === FileCategory::IMAGES;
    }

    public function isVideo(): bool
    {
        return $this->category() === FileCategory::VIDEOS;
    }

    public function isAudio(): bool
    {
        return $this->category() === FileCategory::AUDIO;
    }

    public function isDocument(): bool
    {
        return $this->category() === FileCategory::DOCUMENTS;
    }

    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    /**
     * Formats que le navigateur peut afficher directement.
     */
    public function isPreviewable(): bool
    {
        return $this->isImage() || $this->isVideo() || $this->isAudio() || $this->isPdf();
    }

    public function getHumanSize(): string
    {
        $bytes = max((int) $this->size, 0);
        $units = ['o', 'Ko', 'Mo', 'Go', 'To'];
        $index = 0;

        while ($bytes >= 1024 && $index < count($units) - 1) {
            $bytes /= 1024;
            $index++;
        }

        $value = round($bytes, $index === 0 ? 0 : 1);

        return str_replace('.', ',', (string) $value) . ' ' . $units[$index];
    }
}
