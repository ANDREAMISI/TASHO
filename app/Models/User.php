<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'country',
        'profession',
        'work_type',
        'storage_volume',
        'email_verified_at',
        'avatar',
        'bio',
        'settings',
        'is_active',
        'last_active_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attributs dérivés exposés à l'interface.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'avatar_url',
        'initials',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'settings' => 'array',
        'is_active' => 'boolean',
        'last_active_at' => 'datetime',
    ];

    // ============================================================
    // RELATIONS
    // ============================================================

    /**
     * Relation : L'utilisateur possède une équipe (en tant que propriétaire)
     */
    public function team()
    {
        return $this->hasOne(Team::class, 'owner_id');
    }

    /**
     * Relation : L'utilisateur appartient à plusieurs équipes
     */
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members')
                    ->withPivot('role', 'permissions', 'joined_at', 'last_activity_at')
                    ->withTimestamps();
    }

    /**
     * Relation : L'utilisateur possède plusieurs projets
     */
    public function projects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    /**
     * Relation : L'utilisateur a uploadé plusieurs fichiers
     */
    public function files()
    {
        return $this->hasMany(File::class);
    }

    /**
     * Relation : L'utilisateur a plusieurs commentaires
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Relation : L'utilisateur a plusieurs favoris
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Relation : L'utilisateur a plusieurs abonnements
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    // ============================================================
    // MÉTHODES UTILITAIRES
    // ============================================================

    /**
     * Préférences d'interface par défaut.
     *
     * @var array<string, mixed>
     */
    public const DEFAULT_PREFERENCES = [
        'default_landing' => 'dashboard',
        'files_sort' => 'recent',
        'show_plan_card' => true,
        'sidebar_open' => true,
    ];

    /**
     * Préférences d'interface de l'utilisateur (valeurs par défaut incluses).
     *
     * @return array<string, mixed>
     */
    public function getPreferencesAttribute(): array
    {
        $stored = $this->settings['preferences'] ?? [];

        return array_merge(
            self::DEFAULT_PREFERENCES,
            is_array($stored) ? $stored : [],
        );
    }

    /**
     * URL publique de la photo de profil (null si aucune photo).
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar) {
            return null;
        }

        return route('profile.avatar', [
            'user' => $this->id,
            'v' => $this->updated_at?->timestamp,
        ]);
    }

    /**
     * Initiales de l'utilisateur (avatar de secours).
     */
    public function getInitialsAttribute(): string
    {
        $words = preg_split('/\s+/', trim((string) $this->name)) ?: [];
        $initials = '';

        foreach (array_slice($words, 0, 2) as $word) {
            if ($word !== '') {
                $initials .= mb_substr($word, 0, 1);
            }
        }

        return mb_strtoupper($initials) ?: 'U';
    }

    /**
     * Vérifier si l'utilisateur est super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->email === 'admin@tasho.com';
    }

    /**
     * Obtenir le rôle de l'utilisateur dans une équipe
     */
    public function getRoleInTeam(Team $team): ?string
    {
        $member = $this->teams()->where('team_id', $team->id)->first();
        return $member ? $member->pivot->role : null;
    }

    /**
     * Vérifier si l'utilisateur est membre d'une équipe
     */
    public function isMemberOfTeam(Team $team): bool
    {
        return $this->teams()->where('team_id', $team->id)->exists();
    }

    /**
     * Vérifier si l'utilisateur est propriétaire d'une équipe
     */
    public function isOwnerOfTeam(Team $team): bool
    {
        return $this->team && $this->team->id === $team->id;
    }

    /**
     * Obtenir l'équipe active de l'utilisateur
     */
    public function getActiveTeam(): ?Team
    {
        // Récupérer la première équipe (la plus récente)
        return $this->teams()->orderBy('created_at', 'desc')->first();
    }

    /**
     * Obtenir l'espace de stockage utilisé par l'utilisateur
     */
    public function getStorageUsed(): int
    {
        return $this->files()->sum('size');
    }

    /**
     * Obtenir l'espace de stockage formaté
     */
    public function getStorageUsedFormatted(): string
    {
        $bytes = $this->getStorageUsed();
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        
        while ($bytes > 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Mettre à jour la dernière activité
     */
    public function updateLastActive(): void
    {
        $this->update(['last_active_at' => now()]);
    }

    /**
     * Activer/Désactiver l'utilisateur
     */
    public function toggleActive(): void
    {
        $this->update(['is_active' => !$this->is_active]);
    }
}