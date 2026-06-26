<?php

namespace App\Models;

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

    // Relations
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

    // Vérifications
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function isVideo(): bool
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    public function isDocument(): bool
    {
        return in_array($this->mime_type, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
        ]);
    }

    public function getHumanSize(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}