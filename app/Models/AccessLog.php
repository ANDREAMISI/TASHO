<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessLog extends Model
{
    protected $fillable = [
        'user_id',
        'team_id',
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

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
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

    /**
     * Restreindre les journaux à une équipe.
     *
     * `team_id` est la source principale ; les journaux plus anciens sont
     * rattachés via leur projet ou leur client.
     */
    public function scopeForTeam($query, Team $team)
    {
        return $query->where(function ($query) use ($team) {
            $query->where('team_id', $team->id)
                ->orWhereHas('project', fn ($project) => $project->where('team_id', $team->id))
                ->orWhereHas('client', fn ($client) => $client->where('team_id', $team->id));
        });
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