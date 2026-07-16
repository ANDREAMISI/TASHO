<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Team;
use App\Models\User;
use App\Services\SubscriptionService;
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
        if (!Auth::check() || !Auth::user()->isSuperAdmin()) {
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
                    $q2->where('name', 'LIKE', '%' . $request->search . '%')
                       ->orWhere('email', 'LIKE', '%' . $request->search . '%');
                })->orWhereHas('team', function ($q2) use ($request) {
                    $q2->where('name', 'LIKE', '%' . $request->search . '%');
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
                    'status' => $subscription->status,
                    'status_label' => $this->getStatusLabel($subscription->status),
                    'status_color' => $this->getStatusColor($subscription->status),
                    'billing_cycle' => $subscription->billing_cycle,
                    'amount' => $subscription->amount,
                    'amount_formatted' => $this->formatAmount($subscription->amount),
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                    'last_payment_at' => $subscription->last_payment_at,
                    'next_payment_at' => $subscription->next_payment_at,
                    'notes' => $subscription->notes,
                    'created_at' => $subscription->created_at,
                    'is_active' => $subscription->isActive(),
                    'is_expired' => $subscription->isExpired(),
                    'is_expiring_soon' => $subscription->isExpiringSoon(7),
                ];
            });

        $plans = Plan::where('is_active', true)->get(['id', 'name', 'slug']);
        $statuses = ['active', 'inactive', 'expired', 'cancelled'];

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['status', 'plan_id', 'search']),
            'plans' => $plans,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Afficher le formulaire de création
     */
    public function create()
    {
        $this->checkSuperAdmin();

        $plans = Plan::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'price_monthly', 'price_yearly', 'currency']);
            
        $users = User::orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Subscriptions/Create', [
            'plans' => $plans,
            'users' => $users,
            'billingCycles' => ['monthly', 'yearly'],
            'statuses' => ['active', 'inactive', 'expired', 'cancelled'],
        ]);
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
            'end_date' => 'nullable|date|after:start_date',
            'amount' => 'nullable|integer|min:0',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $user = User::findOrFail($request->user_id);
        
        // Récupérer la première équipe de l'utilisateur
        $team = $user->teams()->first();
        
        if (!$team) {
            return back()->withErrors([
                'user_id' => 'Cet utilisateur n\'appartient à aucune équipe.'
            ]);
        }

        // Montant en FBU
        $amount = $request->amount ?? ($request->billing_cycle === 'monthly' 
            ? $plan->price_monthly 
            : $plan->price_yearly);

        $subscription = Subscription::create([
            'user_id' => $request->user_id,
            'team_id' => $team->id,
            'plan_id' => $request->plan_id,
            'status' => $request->status,
            'billing_cycle' => $request->billing_cycle,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'amount' => $amount,
            'currency' => 'FBU',
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
                'amount_formatted' => $this->formatAmount($subscription->amount),
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

        $plans = Plan::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'price_monthly', 'price_yearly', 'currency']);
            
        $users = User::orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Subscriptions/Edit', [
            'subscription' => [
                'id' => $subscription->id,
                'user_id' => $subscription->user_id,
                'team_id' => $subscription->team_id,
                'plan_id' => $subscription->plan_id,
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'start_date' => $subscription->start_date ? $subscription->start_date->format('Y-m-d') : null,
                'end_date' => $subscription->end_date ? $subscription->end_date->format('Y-m-d') : null,
                'amount' => $subscription->amount,
                'payment_method' => $subscription->payment_method,
                'notes' => $subscription->notes,
            ],
            'plans' => $plans,
            'users' => $users,
            'billingCycles' => ['monthly', 'yearly'],
            'statuses' => ['active', 'inactive', 'expired', 'cancelled'],
        ]);
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
            'end_date' => 'nullable|date|after:start_date',
            'amount' => 'nullable|integer|min:0',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $amount = $request->amount ?? ($request->billing_cycle === 'monthly' 
            ? $plan->price_monthly 
            : $plan->price_yearly);

        $subscription->update([
            'plan_id' => $request->plan_id,
            'status' => $request->status,
            'billing_cycle' => $request->billing_cycle,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'amount' => $amount,
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
    private function formatAmount($amount)
    {
        if ($amount === 0) return 'Gratuit';
        return number_format($amount, 0, ',', ' ') . ' FBU';
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