<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAccess extends Model
{
    protected $table = 'project_accesses';

    protected $fillable = [
        'project_id',
        'client_id',
        'access_token',
        'password',
        'is_public',
        'can_download',
        'can_comment',
        'can_favorite',
        'allowed_folders',
        'expires_at',
        'max_views',
        'view_count',
        'last_accessed_at',
    ];

    protected $casts = [
        'allowed_folders' => 'array',
        'is_public' => 'boolean',
        'can_download' => 'boolean',
        'can_comment' => 'boolean',
        'can_favorite' => 'boolean',
        'expires_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'view_count' => 'integer',
        'max_views' => 'integer',
    ];

    // ============================================================
    // RELATIONS
    // ============================================================

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    // ============================================================
    // MÉTHODES UTILITAIRES
    // ============================================================

    public function isValid(): bool
    {
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_views && $this->view_count >= $this->max_views) {
            return false;
        }

        return true;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isViewLimitReached(): bool
    {
        return $this->max_views && $this->view_count >= $this->max_views;
    }

    public function getShareUrl(): string
    {
        return route('public.gallery', $this->access_token);
    }
}