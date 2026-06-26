<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
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
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
    ];

    // Relations
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Vérifications
    public function hasFeature(string $feature): bool
    {
        return isset($this->features[$feature]) && $this->features[$feature] === true;
    }

    public function isFree(): bool
    {
        return $this->price_monthly == 0 && $this->price_yearly == 0;
    }
}