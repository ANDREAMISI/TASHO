<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SettingsController extends Controller
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
        return Inertia::render('Settings/Index', [
            'user' => Auth::user(),
        ]);
    }

    public function updateTeam(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $team = Auth::user()->teams()->first();
        if ($team) {
            $team->update($request->only('name', 'description'));
        }

        return redirect()->route('settings.index')->with('success', 'Paramètres de l\'équipe mis à jour.');
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'profession' => 'nullable|string|max:100',
            'storage_volume' => 'nullable|string|max:50',
        ]);

        $user = Auth::user();
        $user->update($request->only('name', 'phone', 'country', 'profession', 'storage_volume'));

        return redirect()->route('settings.index')->with('success', 'Profil mis à jour.');
    }

    public function subscription()
    {
        return Inertia::render('Settings/Subscription', [
            'user' => Auth::user(),
        ]);
    }

    // ============================================================
    // MÉTHODES ADMIN
    // ============================================================

    /**
     * Admin - Afficher les paramètres
     */
    public function adminIndex()
    {
        $this->checkSuperAdmin();

        return Inertia::render('Admin/Settings/Index');
    }

    /**
     * Admin - Mettre à jour les paramètres
     */
    public function adminUpdate(Request $request): RedirectResponse
    {
        $this->checkSuperAdmin();

        // Vous pouvez ajouter ici la logique de mise à jour des paramètres
        // Exemple: sauvegarder les paramètres dans la base de données ou dans un fichier de config

        return redirect()->route('admin.settings.index')
            ->with('success', 'Paramètres mis à jour avec succès !');
    }
}