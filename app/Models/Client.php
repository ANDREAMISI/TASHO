<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    // Relations
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accesses(): HasMany
    {
        return $this->hasMany(ProjectAccess::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }
}