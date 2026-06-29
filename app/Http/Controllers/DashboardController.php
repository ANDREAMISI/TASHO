<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        // ✅ Rediriger les Super Admins vers leur dashboard
        if (auth()->user()->isSuperAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return redirect()->route('team.create')
                ->with('info', 'Créez une équipe pour commencer.');
        }

        $stats = $this->dashboardService->getStats($team);

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'team' => $team,
        ]);
    }

    public function admin()
    {
        // ✅ Vérifier avec isSuperAdmin()
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }

        $stats = $this->dashboardService->getAdminStats();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }
}