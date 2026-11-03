<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    protected SubscriptionService $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Vérifier que l'utilisateur est Super Admin
     */
    private function checkSuperAdmin()
    {
        if (! Auth::check() || ! Auth::user()->isSuperAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }

    /**
     * Afficher la liste des abonnements
     */
    public function index(Request $request)
    {
        $this->checkSuperAdmin();

        $query = Subscription::with(['user', 'team', 'plan']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('user', function ($q2) use ($request) {
                    $q2->where('name', 'LIKE', '%'.$request->search.'%')
                        ->orWhere('email', 'LIKE', '%'.$request->search.'%');
                })->orWhereHas('team', function ($q2) use ($request) {
                    $q2->where('name', 'LIKE', '%'.$request->search.'%');
                });
            });
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'user' => $subscription->user ? [
                        'id' => $subscription->user->id,
                        'name' => $subscription->user->name,
                        'email' => $subscription->user->email,
                    ] : null,
                    'team' => $subscription->team ? [
                        'id' => $subscription->team->id,
                        'name' => $subscription->team->name,
                    ] : null,
                    'plan' => $subscription->plan ? [
                        'id' => $subscription->plan->id,
                        'name' => $subscription->plan->name,
                        'slug' => $subscription->plan->slug,
                    ] : null,
                    'plan_id' => $subscription->plan_id,
                    'status' => $subscription->status,
                    'status_label' => $this->getStatusLabel($subscription->status),
                    'status_color' => $this->getStatusColor($subscription->status),
                    'billing_cycle' => $subscription->billing_cycle,
                    'amount' => $subscription->amount,
                    'currency' => $subscription->currency ?? $subscription->plan?->currency ?? 'FBU',
                    'amount_formatted' => $this->formatAmount(
                        $subscription->amount,
                        $subscription->currency ?? $subscription->plan?->currency
                    ),
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                    'last_payment_at' => $subscription->last_payment_at,
                    'next_payment_at' => $subscription->next_payment_at,
                    'notes' => $subscription->notes,
                    'payment_method' => $subscription->payment_method,
                    'created_at' => $subscription->created_at,
                    'is_active' => $subscription->isActive(),
                    'is_expired' => $subscription->isExpired(),
                    'is_expiring_soon' => $subscription->isExpiringSoon(21),
                ];
            });

        $subscriptionToEdit = $request->filled('edit')
            ? Subscription::with(['user', 'plan'])->findOrFail($request->integer('edit'))
            : null;

        $plansQuery = Plan::where('is_active', true);
        if ($subscriptionToEdit) {
            $plansQuery->orWhereKey($subscriptionToEdit->plan_id);
        }

        $plans = $plansQuery->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'price_monthly', 'price_yearly', 'currency']);
        $statuses = ['active', 'inactive', 'expired', 'cancelled'];

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['status', 'plan_id', 'search']),
            'plans' => $plans,
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
            'statuses' => $statuses,
            'initialSubscription' => $subscriptionToEdit
                ? $this->subscriptionFormData($subscriptionToEdit)
                : null,
            'openCreateForm' => $request->boolean('create'),
        ]);
    }

    /**
     * Afficher le formulaire de création
     */
    public function create()
    {
        $this->checkSuperAdmin();

        return redirect()->route('admin.subscriptions.index', ['create' => 1]);
    }

    /**
     * Créer un abonnement
     */
    public function store(Request $request)
    {
        $this->checkSuperAdmin();

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'status' => 'required|in:active,inactive,expired,cancelled',
            'billing_cycle' => 'required|in:monthly,yearly',
            'start_date' => 'required|date',
            'amount' => 'nullable|integer|min:0',
            'currency' => 'nullable|string|size:3|alpha',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $user = User::findOrFail($request->user_id);

        // Récupérer la première équipe de l'utilisateur
        $team = $user->teams()->first();

        if (! $team) {
            return back()->withErrors([
                'user_id' => 'Cet utilisateur n\'appartient à aucune équipe.',
            ]);
        }

        $amount = $request->amount ?? ($request->billing_cycle === 'monthly'
            ? $plan->price_monthly
            : $plan->price_yearly);
        $startDate = Carbon::parse($request->start_date);
        $endDate = $request->billing_cycle === 'monthly'
            ? $startDate->copy()->addMonthNoOverflow()
            : $startDate->copy()->addYearNoOverflow();

        $subscription = Subscription::create([
            'user_id' => $request->user_id,
            'team_id' => $team->id,
            'plan_id' => $request->plan_id,
            'status' => $request->status,
            'billing_cycle' => $request->billing_cycle,
            'start_date' => $request->start_date,
            'end_date' => $endDate,
            'amount' => $amount,
            'currency' => strtoupper($request->currency ?: $plan->currency ?: 'FBU'),
            'payment_method' => $request->payment_method,
            'notes' => $request->notes,
        ]);

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Abonnement créé avec succès !');
    }

    /**
     * Afficher un abonnement
     */
    public function show(Subscription $subscription)
    {
        $this->checkSuperAdmin();

        $subscription->load(['user', 'team', 'plan']);

        return Inertia::render('Admin/Subscriptions/Show', [
            'subscription' => [
                'id' => $subscription->id,
                'user' => $subscription->user,
                'team' => $subscription->team,
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'status_label' => $this->getStatusLabel($subscription->status),
                'status_color' => $this->getStatusColor($subscription->status),
                'billing_cycle' => $subscription->billing_cycle,
                'amount' => $subscription->amount,
                'currency' => $subscription->currency ?? $subscription->plan?->currency ?? 'FBU',
                'amount_formatted' => $this->formatAmount(
                    $subscription->amount,
                    $subscription->currency ?? $subscription->plan?->currency
                ),
                'payment_method' => $subscription->payment_method,
                'payment_data' => $subscription->payment_data,
                'start_date' => $subscription->start_date,
                'end_date' => $subscription->end_date,
                'last_payment_at' => $subscription->last_payment_at,
                'next_payment_at' => $subscription->next_payment_at,
                'notes' => $subscription->notes,
                'created_at' => $subscription->created_at,
                'updated_at' => $subscription->updated_at,
                'is_active' => $subscription->isActive(),
                'is_expired' => $subscription->isExpired(),
                'days_remaining' => $subscription->end_date
                    ? now()->diffInDays($subscription->end_date, false)
                    : null,
            ],
        ]);
    }

    /**
     * Afficher le formulaire de modification
     */
    public function edit(Subscription $subscription)
    {
        $this->checkSuperAdmin();

        $subscription->load(['user', 'team', 'plan']);

        return redirect()->route('admin.subscriptions.index', ['edit' => $subscription->id]);
    }

    /**
     * Mettre à jour un abonnement
     */
    public function update(Request $request, Subscription $subscription)
    {
        $this->checkSuperAdmin();

        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'status' => 'required|in:active,inactive,expired,cancelled',
            'billing_cycle' => 'required|in:monthly,yearly',
            'start_date' => 'required|date',
            'amount' => 'nullable|integer|min:0',
            'currency' => 'nullable|string|size:3|alpha',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $amount = $request->amount ?? ($request->billing_cycle === 'monthly'
            ? $plan->price_monthly
            : $plan->price_yearly);
        $startDate = Carbon::parse($request->start_date);
        $endDate = $request->billing_cycle === 'monthly'
            ? $startDate->copy()->addMonthNoOverflow()
            : $startDate->copy()->addYearNoOverflow();

        $subscription->update([
            'plan_id' => $request->plan_id,
            'status' => $request->status,
            'billing_cycle' => $request->billing_cycle,
            'start_date' => $request->start_date,
            'end_date' => $endDate,
            'amount' => $amount,
            'currency' => strtoupper($request->currency ?: $plan->currency ?: 'FBU'),
            'payment_method' => $request->payment_method,
            'notes' => $request->notes,
        ]);

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Abonnement mis à jour avec succès !');
    }

    /**
     * Supprimer un abonnement
     */
    public function destroy(Subscription $subscription)
    {
        $this->checkSuperAdmin();

        $subscription->delete();

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Abonnement supprimé avec succès !');
    }

    /**
     * Activer/Désactiver un abonnement
     */
    public function toggle(Subscription $subscription)
    {
        $this->checkSuperAdmin();

        $newStatus = $subscription->status === 'active' ? 'inactive' : 'active';
        $subscription->update(['status' => $newStatus]);

        $message = $newStatus === 'active'
            ? 'Abonnement activé avec succès !'
            : 'Abonnement désactivé avec succès !';

        return back()->with('success', $message);
    }

    /**
     * Formater le montant en FBU
     */
    private function formatAmount($amount, ?string $currency = 'FBU')
    {
        if ($amount === 0) {
            return 'Gratuit';
        }

        return number_format($amount, 0, ',', ' ').' '.($currency ?: 'FBU');
    }

    private function subscriptionFormData(Subscription $subscription): array
    {
        return [
            'id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'user_name' => $subscription->user?->name,
            'plan_id' => $subscription->plan_id,
            'status' => $subscription->status,
            'billing_cycle' => $subscription->billing_cycle,
            'start_date' => $subscription->start_date?->format('Y-m-d'),
            'amount' => $subscription->amount,
            'currency' => $subscription->currency ?? $subscription->plan?->currency ?? 'FBU',
            'payment_method' => $subscription->payment_method,
            'notes' => $subscription->notes,
        ];
    }

    /**
     * Obtenir le libellé d'un statut
     */
    private function getStatusLabel(string $status): string
    {
        return [
            'active' => 'Actif',
            'inactive' => 'Inactif',
            'expired' => 'Expiré',
            'cancelled' => 'Annulé',
        ][$status] ?? $status;
    }

    /**
     * Obtenir la couleur d'un statut
     */
    private function getStatusColor(string $status): string
    {
        return [
            'active' => 'green',
            'inactive' => 'gray',
            'expired' => 'red',
            'cancelled' => 'yellow',
        ][$status] ?? 'gray';
    }
}
