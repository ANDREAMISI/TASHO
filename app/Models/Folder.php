<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Folder extends Model
{
    protected $fillable = [
        'project_id',
        'parent_id',
        'created_by',
        'name',
        'path',
        'slug',
        'is_public',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_public' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($folder) {
            if (empty($folder->slug)) {
                $folder->slug = Str::slug($folder->name) . '-' . Str::random(6);
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

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    // ============================================================
    // MÉTHODES UTILITAIRES
    // ============================================================

    public function getFullPath(): string
    {
        if ($this->parent) {
            return $this->parent->getFullPath() . '/' . $this->name;
        }
        return '/' . $this->name;
    }

    public function getFileCount(): int
    {
        return $this->files()->count();
    }

    public function getChildrenCount(): int
    {
        return $this->children()->count();
    }

    public function getTotalItemsCount(): int
    {
        $count = $this->getFileCount();
        
        foreach ($this->children as $child) {
            $count += $child->getTotalItemsCount();
        }
        
        return $count;
    }

    public function isRoot(): bool
    {
        return $this->parent_id === null;
    }

    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    public function hasFiles(): bool
    {
        return $this->files()->exists();
    }

    public function isAccessibleByUser(User $user): bool
    {
        // Vérifier si l'utilisateur a accès au projet parent
        return $this->project->isOwner($user) || $this->project->hasMember($user);
    }
}