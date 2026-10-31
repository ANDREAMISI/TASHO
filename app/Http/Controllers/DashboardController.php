<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Services\NotificationService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;
    protected NotificationService $notifications;

    public function __construct(
        DashboardService $dashboardService,
        NotificationService $notifications
    ) {
        $this->dashboardService = $dashboardService;
        $this->notifications = $notifications;
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
            return redirect()->route('team.index', ['create' => 1])
                ->with('info', 'Créez une équipe pour commencer.');
        }

        // Alertes d'abonnement / stockage, au plus une fois par jour.
        $this->notifications->scanAccountAlerts($team);

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