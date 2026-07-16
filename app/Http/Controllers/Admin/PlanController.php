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
        if (!Auth::check() || !Auth::user()->isSuperAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }

    /**
     * Formater le stockage en unités lisibles
     */
    private function formatStorage($bytes)
    {
        if ($bytes === 0) return '0 B';
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes, 1024));
        return round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
    }

    /**
     * Formater le prix en FBU
     */
    private function formatPrice($price)
    {
        if ($price === 0) return 'Gratuit';
        return number_format($price, 0, ',', ' ') . ' FBU';
    }

    public function index()
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
                'price_monthly_formatted' => $this->formatPrice($plan->price_monthly),
                'price_yearly' => $plan->price_yearly,
                'price_yearly_formatted' => $this->formatPrice($plan->price_yearly),
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
        ]);
    }

    public function create()
    {
        $this->checkSuperAdmin();

        return Inertia::render('Admin/Plans/Create');
    }

    public function store(Request $request)
    {
        $this->checkSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:plans,slug|max:255',
            'description' => 'nullable|string',
            'storage_limit' => 'required|integer|min:0',
            'max_team_members' => 'required|integer|min:1',
            'max_projects' => 'integer|nullable',
            'max_file_size' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'price_monthly' => 'required|integer|min:0',
            'price_yearly' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer|nullable',
        ]);

        $plan = Plan::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'],
            'storage_limit' => $validated['storage_limit'],
            'max_team_members' => $validated['max_team_members'],
            'max_projects' => $validated['max_projects'] ?? -1,
            'max_file_size' => $validated['max_file_size'],
            'features' => $validated['features'] ?? [],
            'price_monthly' => $validated['price_monthly'],
            'price_yearly' => $validated['price_yearly'],
            'currency' => 'FBU',
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plan créé avec succès !');
    }

    public function show(Plan $plan)
    {
        $this->checkSuperAdmin();

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
                'price_monthly_formatted' => $this->formatPrice($plan->price_monthly),
                'price_yearly' => $plan->price_yearly,
                'price_yearly_formatted' => $this->formatPrice($plan->price_yearly),
                'currency' => $plan->currency,
                'is_active' => $plan->is_active,
                'features' => $plan->features,
                'sort_order' => $plan->sort_order,
                'created_at' => $plan->created_at,
            ],
        ]);
    }

    public function edit(Plan $plan)
    {
        $this->checkSuperAdmin();

        return Inertia::render('Admin/Plans/Edit', [
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
                'price_yearly' => $plan->price_yearly,
                'currency' => $plan->currency,
                'is_active' => $plan->is_active,
                'features' => $plan->features,
                'sort_order' => $plan->sort_order,
            ],
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $this->checkSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug,' . $plan->id,
            'description' => 'nullable|string',
            'storage_limit' => 'required|integer|min:0',
            'max_team_members' => 'required|integer|min:1',
            'max_projects' => 'integer|nullable',
            'max_file_size' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'price_monthly' => 'required|integer|min:0',
            'price_yearly' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer|nullable',
        ]);

        $plan->update($validated);

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plan mis à jour avec succès !');
    }

    public function destroy(Plan $plan)
    {
        $this->checkSuperAdmin();

        // Vérifier si le plan est utilisé
        if ($plan->subscriptions()->exists()) {
            return back()->withErrors([
                'message' => 'Ce plan est utilisé par des abonnements et ne peut pas être supprimé.'
            ]);
        }

        $plan->delete();

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plan supprimé avec succès !');
    }

    public function toggle(Plan $plan)
    {
        $this->checkSuperAdmin();

        $plan->update(['is_active' => !$plan->is_active]);

        $message = $plan->is_active ? 'Plan activé' : 'Plan désactivé';

        return back()->with('success', $message . ' avec succès !');
    }
}