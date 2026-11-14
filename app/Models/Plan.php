<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /**
     * Libellés des fonctionnalités configurables depuis l'administration.
     */
    public const FEATURE_LABELS = [
        'stockage_base' => 'Stockage de base',
        'partage_client' => 'Partage client',
        'commentaires' => 'Commentaires',
        'equipe' => 'Collaboration équipe',
        'audit' => 'Audit complet',
        'support_email' => 'Support par email',
        'permissions_avancees' => 'Permissions avancées',
        'api_access' => 'Accès API',
        'support_prioritaire' => 'Support prioritaire',
        'branding_personnalise' => 'Branding personnalisé',
    ];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'storage_limit',
        'max_team_members',
        'max_projects',
        'max_file_size',
        'features',
        'price_monthly',
        'price_yearly',
        'currency',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'storage_limit' => 'integer',
        'max_team_members' => 'integer',
        'max_projects' => 'integer',
        'max_file_size' => 'integer',
        'price_monthly' => 'integer',
        'price_yearly' => 'integer',
    ];

    /**
     * Le seeder historique enregistrait les fonctionnalités doublement encodées.
     * On normalise systématiquement la valeur en tableau.
     */
    public function getFeaturesAttribute($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);

            while (is_string($decoded)) {
                $decoded = json_decode($decoded, true);
            }

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price_monthly');
    }

    /**
     * Formater une taille en octets pour l'affichage.
     */
    public static function formatBytes(?int $bytes): string
    {
        $bytes = (int) $bytes;

        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $power = (int) min(floor(log($bytes, 1024)), count($units) - 1);
        $value = $bytes / (1024 ** $power);

        return rtrim(rtrim(number_format($value, 2, ',', ' '), '0'), ',') . ' ' . $units[$power];
    }

    /**
     * Liste des caractéristiques à afficher sur les pages publiques.
     *
     * @return array<int, array{name: string, value: string|bool}>
     */
    public function publicFeatures(): array
    {
        $features = [
            ['name' => 'Stockage', 'value' => self::formatBytes($this->storage_limit)],
            ['name' => 'Membres', 'value' => $this->max_team_members === -1 ? 'Illimité' : (string) $this->max_team_members],
            ['name' => 'Projets', 'value' => $this->max_projects === -1 ? 'Illimité' : (string) $this->max_projects],
            ['name' => 'Taille max. par fichier', 'value' => self::formatBytes($this->max_file_size)],
        ];

        foreach (self::FEATURE_LABELS as $key => $label) {
            if (array_key_exists($key, $this->features ?? [])) {
                $features[] = [
                    'name' => $label,
                    'value' => (bool) $this->features[$key],
                ];
            }
        }

        return $features;
    }

    /**
     * Représentation du plan utilisée par les pages publiques.
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price_monthly' => (int) $this->price_monthly,
            'price_monthly_formatted' => $this->isFree() ? 'Gratuit' : $this->getFormattedPriceMonthly(),
            'price_yearly' => (int) $this->price_yearly,
            'price_yearly_formatted' => $this->price_yearly > 0 ? $this->getFormattedPriceYearly() : 'Gratuit',
            'currency' => $this->currency ?? 'FBU',
            'is_free' => $this->isFree(),
            'storage_limit' => (int) $this->storage_limit,
            'storage_human' => self::formatBytes($this->storage_limit),
            'max_team_members' => (int) $this->max_team_members,
            'max_projects' => (int) $this->max_projects,
            'max_file_size' => (int) $this->max_file_size,
            'max_file_size_human' => self::formatBytes($this->max_file_size),
            'features' => $this->publicFeatures(),
        ];
    }

    public function hasFeature(string $feature): bool
    {
        return isset($this->features[$feature]) && $this->features[$feature] === true;
    }

    public function isFree(): bool
    {
        return $this->price_monthly == 0 && $this->price_yearly == 0;
    }

    public function getFormattedPriceMonthly(): string
    {
        return number_format($this->price_monthly, 0, ',', ' ') . ' FBU';
    }

    public function getFormattedPriceYearly(): string
    {
        return number_format($this->price_yearly, 0, ',', ' ') . ' FBU';
    }
}