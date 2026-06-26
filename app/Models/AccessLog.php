<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessLog extends Model
{
    protected $fillable = [
        'user_id',
        'project_id',
        'file_id',
        'client_id',
        'visitor_name',
        'visitor_email',
        'action',
        'resource_type',
        'resource_id',
        'details',
        'ip_address',
        'user_agent',
        'session_id',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    // Scopes
    public function scopeRecent($query, int $limit = 50)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where('user_id', $user->id)
                    ->orWhereHas('project', function ($q) use ($user) {
                        $q->where('owner_id', $user->id)
                          ->orWhereHas('members', function ($q2) use ($user) {
                              $q2->where('user_id', $user->id);
                          });
                    });
    }
}