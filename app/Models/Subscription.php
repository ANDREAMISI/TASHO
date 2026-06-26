<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'team_id',
        'plan_id',
        'start_date',
        'end_date',
        'status',
        'billing_cycle',
        'amount',
        'payment_method',
        'payment_data',
        'last_payment_at',
        'next_payment_at',
        'notes',
    ];

    protected $casts = [
        'payment_data' => 'array',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'last_payment_at' => 'datetime',
        'next_payment_at' => 'datetime',
        'amount' => 'decimal:2',
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

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    // Vérifications
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }

    public function isExpiringSoon(int $days = 7): bool
    {
        return $this->end_date && $this->end_date->diffInDays(now()) <= $days;
    }
}