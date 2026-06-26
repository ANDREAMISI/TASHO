<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Plan;
use App\Models\User;
use App\Models\Team;
use Carbon\Carbon;

class SubscriptionService
{
    /**
     * Créer un abonnement
     */
    public function createSubscription(
        int $userId,
        int $teamId,
        int $planId,
        array $data
    ): Subscription {
        return Subscription::create([
            'user_id' => $userId,
            'team_id' => $teamId,
            'plan_id' => $planId,
            'status' => $data['status'] ?? 'active',
            'billing_cycle' => $data['billing_cycle'] ?? 'monthly',
            'start_date' => $data['start_date'] ?? now(),
            'end_date' => $data['end_date'] ?? null,
            'amount' => $data['amount'] ?? 0,
            'payment_method' => $data['payment_method'] ?? null,
            'payment_data' => $data['payment_data'] ?? null,
            'last_payment_at' => $data['last_payment_at'] ?? null,
            'next_payment_at' => $data['next_payment_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Calculer la date de fin d'un abonnement
     */
    public function calculateEndDate(Carbon $startDate, string $billingCycle, int $duration = 1): Carbon
    {
        return $billingCycle === 'monthly' 
            ? $startDate->copy()->addMonths($duration)
            : $startDate->copy()->addYears($duration);
    }

    /**
     * Vérifier si une équipe a un abonnement actif
     */
    public function hasActiveSubscription(Team $team): bool
    {
        return $team->subscription()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->exists();
    }

    /**
     * Obtenir l'abonnement actif d'une équipe
     */
    public function getActiveSubscription(Team $team): ?Subscription
    {
        return $team->subscription()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->first();
    }

    /**
     * Renouveler un abonnement
     */
    public function renewSubscription(Subscription $subscription): void
    {
        if ($subscription->billing_cycle === 'monthly') {
            $newEndDate = $subscription->end_date 
                ? $subscription->end_date->copy()->addMonth()
                : now()->addMonth();
        } else {
            $newEndDate = $subscription->end_date 
                ? $subscription->end_date->copy()->addYear()
                : now()->addYear();
        }

        $subscription->update([
            'end_date' => $newEndDate,
            'last_payment_at' => now(),
            'next_payment_at' => $newEndDate,
            'status' => 'active',
        ]);
    }

    /**
     * Mettre à jour le plan d'un abonnement
     */
    public function changePlan(Subscription $subscription, Plan $newPlan): void
    {
        // Calculer le pro rata si l'abonnement est actif
        if ($subscription->isActive()) {
            $remainingDays = $subscription->end_date 
                ? now()->diffInDays($subscription->end_date, false)
                : 30;
            
            // Ajuster le montant au prorata
            // ...
        }

        $subscription->update([
            'plan_id' => $newPlan->id,
            'amount' => $newPlan->price_monthly,
        ]);
    }

    /**
     * Annuler un abonnement
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'status' => 'cancelled',
            'end_date' => now(),
        ]);
    }

    /**
     * Obtenir les statistiques des abonnements
     */
    public function getSubscriptionStats(): array
    {
        $total = Subscription::count();
        $active = Subscription::where('status', 'active')->count();
        $byPlan = Subscription::where('status', 'active')
            ->with('plan')
            ->get()
            ->groupBy('plan.name')
            ->map(function ($group) {
                return $group->count();
            })
            ->toArray();

        $monthlyRevenue = Subscription::where('status', 'active')
            ->where('billing_cycle', 'monthly')
            ->sum('amount');

        $yearlyRevenue = Subscription::where('status', 'active')
            ->where('billing_cycle', 'yearly')
            ->sum('amount') / 12;

        $expiringSoon = Subscription::where('status', 'active')
            ->whereNotNull('end_date')
            ->where('end_date', '<=', now()->addDays(7))
            ->count();

        return [
            'total' => $total,
            'active' => $active,
            'by_plan' => $byPlan,
            'monthly_revenue' => $monthlyRevenue,
            'yearly_revenue' => $yearlyRevenue,
            'total_mrr' => $monthlyRevenue + $yearlyRevenue,
            'expiring_soon' => $expiringSoon,
        ];
    }
}