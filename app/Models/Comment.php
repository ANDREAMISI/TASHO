<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = [
        'project_id',
        'file_id',
        'user_id',
        'visitor_name',
        'visitor_email',
        'parent_id',
        'content',
        'metadata',
        'is_resolved',
        'resolved_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    // Relations
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    public function getAuthorName(): string
    {
        if ($this->user) {
            return $this->user->name;
        }
        return $this->visitor_name ?? 'Anonyme';
    }

    public function getAuthorEmail(): ?string
    {
        if ($this->user) {
            return $this->user->email;
        }
        return $this->visitor_email;
    }
}