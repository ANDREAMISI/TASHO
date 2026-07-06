<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeamController extends Controller
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

        $teams = Team::with('owner')->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Admin/Teams/Index', [
            'teams' => $teams,
        ]);
    }

    public function show(Team $team)
    {
        $this->checkSuperAdmin();

        $team->load(['owner', 'members']);

        return Inertia::render('Admin/Teams/Show', [
            'team' => $team,
        ]);
    }

    public function toggle(Team $team)
    {
        $this->checkSuperAdmin();

        $team->update(['is_active' => !$team->is_active]);

        return redirect()->route('admin.teams.index')
            ->with('success', 'Statut de l\'équipe mis à jour.');
    }

    public function destroy(Team $team)
    {
        $this->checkSuperAdmin();

        $team->delete();

        return redirect()->route('admin.teams.index')
            ->with('success', 'Équipe supprimée.');
    }
}