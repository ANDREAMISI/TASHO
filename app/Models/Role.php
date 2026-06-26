<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
    ];

    // Relations
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members', 'role_id', 'user_id');
    }

    // Scopes
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    public function scopeNonSystem($query)
    {
        return $query->where('is_system', false);
    }
}