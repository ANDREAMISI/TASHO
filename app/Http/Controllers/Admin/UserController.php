<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
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

        $users = User::orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function show(User $user)
    {
        $this->checkSuperAdmin();

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->checkSuperAdmin();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($request->only('name', 'email', 'is_active'));

        return redirect()->route('admin.users.show', $user)->with('success', 'Utilisateur mis à jour.');
    }

    public function toggle(User $user)
    {
        $this->checkSuperAdmin();

        $user->toggleActive();

        return redirect()->route('admin.users.index')
            ->with('success', 'Statut utilisateur mis à jour.');
    }

    public function destroy(User $user)
    {
        $this->checkSuperAdmin();

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur supprimé.');
    }
}