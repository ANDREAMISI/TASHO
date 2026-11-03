<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PlanController extends Controller
{
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
     * Formater le stockage en unités lisibles
     */
    private function formatStorage($bytes)
    {
        if ($bytes === 0) {
            return '0 B';
        }
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $i), 2).' '.$units[$i];
    }

    /**
     * Formater le prix selon la devise du plan
     */
    private function formatPrice($price, string $currency = 'FBU')
    {
        if ($price === 0) {
            return 'Gratuit';
        }

        return number_format($price, 0, ',', ' ').' '.$currency;
    }

    public function index(Request $request)
    {
        $this->checkSuperAdmin();

        $plans = Plan::orderBy('sort_order')->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'storage_limit' => $plan->storage_limit,
                'storage_human' => $this->formatStorage($plan->storage_limit),
                'max_team_members' => $plan->max_team_members,
                'max_projects' => $plan->max_projects,
                'max_file_size' => $plan->max_file_size,
                'max_file_size_human' => $this->formatStorage($plan->max_file_size),
                'price_monthly' => $plan->price_monthly,
                'price_monthly_formatted' => $this->formatPrice($plan->price_monthly, $plan->currency ?? 'FBU'),
                'price_yearly' => $plan->price_yearly,
                'price_yearly_formatted' => $this->formatPrice($plan->price_yearly, $plan->currency ?? 'FBU'),
                'currency' => $plan->currency ?? 'FBU',
                'is_active' => $plan->is_active,
                'features' => $plan->features,
                'sort_order' => $plan->sort_order,
                'created_at' => $plan->created_at,
                'updated_at' => $plan->updated_at,
            ];
        });

        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans,
            'initialPlan' => $request->filled('edit')
                ? Plan::findOrFail($request->integer('edit'))
                : null,
            'openCreateForm' => $request->boolean('create'),
        ]);
    }

    public function create()
    {
        $this->checkSuperAdmin();

        return redirect()->route('admin.plans.index', ['create' => 1]);
    }

    public function store(Request $request)
    {
        $this->checkSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:plans,slug|max:255',
            'description' => 'nullable|string',
            'storage_limit' => 'sometimes|integer|min:0',
            'max_team_members' => 'sometimes|integer|min:-1|not_in:0',
            'max_projects' => 'sometimes|nullable|integer|min:-1|not_in:0',
            'max_file_size' => 'sometimes|integer|min:0',
            'features' => 'sometimes|nullable|array',
            'price_monthly' => 'required|integer|min:0',
            'price_yearly' => 'required|integer|min:0',
            'currency' => 'nullable|string|size:3|alpha',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|nullable|integer',
        ]);

        $plan = Plan::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'storage_limit' => $validated['storage_limit'] ?? 1073741824,
            'max_team_members' => $validated['max_team_members'] ?? 1,
            'max_projects' => $validated['max_projects'] ?? -1,
            'max_file_size' => $validated['max_file_size'] ?? 52428800,
            'features' => $validated['features'] ?? [],
            'price_monthly' => $validated['price_monthly'],
            'price_yearly' => $validated['price_yearly'],
            'currency' => strtoupper(($validated['currency'] ?? null) ?: 'FBU'),
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plan créé avec succès !');
    }

    public function show(Plan $plan)
    {
        $this->checkSuperAdmin();

        $plan->loadCount('subscriptions')->load([
            'subscriptions' => fn ($query) => $query
                ->with('user:id,name,email')
                ->latest()
                ->limit(10),
        ]);

        return Inertia::render('Admin/Plans/Show', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'storage_limit' => $plan->storage_limit,
                'storage_human' => $this->formatStorage($plan->storage_limit),
                'max_team_members' => $plan->max_team_members,
                'max_projects' => $plan->max_projects,
                'max_file_size' => $plan->max_file_size,
                'max_file_size_human' => $this->formatStorage($plan->max_file_size),
                'price_monthly' => $plan->price_monthly,
                'price_monthly_formatted' => $this->formatPrice($plan->price_monthly, $plan->currency ?? 'FBU'),
                'price_yearly' => $plan->price_yearly,
                'price_yearly_formatted' => $this->formatPrice($plan->price_yearly, $plan->currency ?? 'FBU'),
                'currency' => $plan->currency,
                'is_active' => $plan->is_active,
                'features' => $plan->features,
                'sort_order' => $plan->sort_order,
                'created_at' => $plan->created_at,
                'updated_at' => $plan->updated_at,
                'subscriptions_count' => $plan->subscriptions_count,
                'subscriptions' => $plan->subscriptions->map(fn ($subscription) => [
                    'id' => $subscription->id,
                    'user' => $subscription->user ? [
                        'id' => $subscription->user->id,
                        'name' => $subscription->user->name,
                        'email' => $subscription->user->email,
                    ] : null,
                    'status' => $subscription->status,
                    'billing_cycle' => $subscription->billing_cycle,
                    'amount' => $subscription->amount,
                    'currency' => $subscription->currency ?: $plan->currency,
                    'end_date' => $subscription->end_date,
                ]),
            ],
        ]);
    }

    public function edit(Plan $plan)
    {
        $this->checkSuperAdmin();

        return redirect()->route('admin.plans.index', ['edit' => $plan->id]);
    }

    public function update(Request $request, Plan $plan)
    {
        $this->checkSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug,'.$plan->id,
            'description' => 'nullable|string',
            'storage_limit' => 'sometimes|integer|min:0',
            'max_team_members' => 'sometimes|integer|min:-1|not_in:0',
            'max_projects' => 'sometimes|nullable|integer|min:-1|not_in:0',
            'max_file_size' => 'sometimes|integer|min:0',
            'features' => 'sometimes|nullable|array',
            'price_monthly' => 'required|integer|min:0',
            'price_yearly' => 'required|integer|min:0',
            'currency' => 'nullable|string|size:3|alpha',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|nullable|integer',
        ]);

        $validated['currency'] = strtoupper(($validated['currency'] ?? null) ?: 'FBU');
        $plan->update($validated);

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plan mis à jour avec succès !');
    }

    public function destroy(Plan $plan)
    {
        $this->checkSuperAdmin();

        // Vérifier si le plan est utilisé
        if ($plan->subscriptions()->exists()) {
            return back()->with('error', 'Ce plan est utilisé par des abonnements et ne peut pas être supprimé.');
        }

        $plan->delete();

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plan supprimé avec succès !');
    }

    public function toggle(Plan $plan)
    {
        $this->checkSuperAdmin();

        $plan->update(['is_active' => ! $plan->is_active]);

        $message = $plan->is_active ? 'Plan activé' : 'Plan désactivé';

        return back()->with('success', $message.' avec succès !');
    }
}
