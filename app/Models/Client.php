<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Client extends Model
{
    protected $fillable = [
        'team_id',
        'user_id',
        'name',
        'email',
        'phone',
        'company',
        'avatar',
        'notes',
        'metadata',
        'last_interaction_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_interaction_at' => 'datetime',
    ];

    // ============================================================
    // RELATIONS
    // ============================================================

    /**
     * Relation : Le client appartient à une équipe
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Relation : Le client est associé à un utilisateur (optionnel)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation : Le client a plusieurs accès à des projets
     */
    public function accesses(): HasMany
    {
        return $this->hasMany(ProjectAccess::class);
    }

    /**
     * Relation : Le client a plusieurs logs d'activité
     */
    public function logs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }

    /**
     * Relation : Le client a plusieurs favoris
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * ✅ Relation : Le client a plusieurs projets (via les accès)
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_accesses', 'client_id', 'project_id')
                    ->withPivot('access_token', 'is_public', 'can_download', 'can_comment', 'expires_at')
                    ->withTimestamps();
    }

    // ============================================================
    // MÉTHODES UTILITAIRES
    // ============================================================

    /**
     * Vérifier si le client a accès à un projet
     */
    public function hasAccessToProject(Project $project): bool
    {
        return $this->accesses()->where('project_id', $project->id)->exists();
    }

    /**
     * Obtenir les projets accessibles par le client
     */
    public function getAccessibleProjects()
    {
        return $this->projects()->where('expires_at', '>=', now())->get();
    }

    /**
     * Mettre à jour la dernière interaction
     */
    public function updateLastInteraction(): void
    {
        $this->update(['last_interaction_at' => now()]);
    }

    /**
     * Obtenir le nom complet formaté
     */
    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    /**
     * Obtenir l'avatar (ou les initiales)
     */
    public function getAvatarInitialsAttribute(): string
    {
        $words = explode(' ', $this->name);
        $initials = '';

        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper($word[0]);
            }
        }

        return substr($initials, 0, 2);
    }
}