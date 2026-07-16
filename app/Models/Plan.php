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

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
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