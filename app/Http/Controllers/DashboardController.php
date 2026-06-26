<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return Inertia::render('Dashboard/Setup');
        }

        $stats = $this->dashboardService->getStats($team);

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'team' => $team,
        ]);
    }

    public function admin()
    {
        if (!Gate::allows('is-super-admin')) {
            abort(403);
        }

        $stats = $this->dashboardService->getAdminStats();

        return Inertia::render('Dashboard/Admin', [
            'stats' => $stats,
        ]);
    }
}