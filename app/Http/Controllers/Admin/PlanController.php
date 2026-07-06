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

    public function index()
    {
        $this->checkSuperAdmin();

        $plans = Plan::orderBy('sort_order')->get();

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
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer|nullable',
        ]);

        $plan = Plan::create($validated);

        return redirect()->route('admin.plans.index')
            ->with('success', 'Plan créé avec succès !');
    }

    public function show(Plan $plan)
    {
        $this->checkSuperAdmin();

        return Inertia::render('Admin/Plans/Show', [
            'plan' => $plan,
        ]);
    }

    public function edit(Plan $plan)
    {
        $this->checkSuperAdmin();

        return Inertia::render('Admin/Plans/Edit', [
            'plan' => $plan,
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
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
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