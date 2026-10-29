<?php

namespace App\Services;

use App\Models\File;
use App\Models\Plan;
use App\Models\Team;
use App\Models\User;

/**
 * Résumé de facturation affiché dans la barre latérale de l'espace client.
 */
class BillingSummaryService
{
    /**
     * Quota appliqué lorsqu'aucun plan n'est trouvé (1 Go).
     */
    private const DEFAULT_STORAGE_LIMIT = 1073741824;

    /**
     * Construire le résumé pour l'équipe active de l'utilisateur.
     *
     * @return array<string, mixed>|null
     */
    public function forUser(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        $team = $user->getActiveTeam();

        return $team ? $this->forTeam($team) : null;
    }

    /**
     * Construire le résumé (plan + stockage) d'une équipe.
     *
     * @return array<string, mixed>
     */
    public function forTeam(Team $team): array
    {
        $subscription = $team->subscription()
            ->with('plan')
            ->where('status', 'active')
            ->orderByDesc('start_date')
            ->first()
            ?? $team->subscription()
                ->with('plan')
                ->orderByDesc('start_date')
                ->first();

        $plan = $subscription?->plan ?? Plan::where('slug', 'free')->first();

        $storageUsed = (int) File::whereIn('project_id', $team->projects()->select('id'))->sum('size');
        $storageLimit = (int) ($plan?->storage_limit ?? self::DEFAULT_STORAGE_LIMIT);

        return [
            'plan' => [
                'id' => $plan?->id,
                'name' => $plan?->name,
                'slug' => $plan?->slug,
            ],
            'subscription' => $subscription ? [
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'end_date' => $subscription->end_date?->toIso8601String(),
                'is_expired' => $subscription->isExpired(),
            ] : null,
            'storage' => [
                'used' => $storageUsed,
                'limit' => $storageLimit,
                'percentage' => $this->percentage($storageUsed, $storageLimit),
            ],
        ];
    }

    private function percentage(int $used, int $limit): float
    {
        if ($limit <= 0) {
            return 0.0;
        }

        return round(min(($used / $limit) * 100, 100), 1);
    }
}
