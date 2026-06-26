<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function index()
    {
        Gate::authorize('is-super-admin');

        $users = User::paginate(15);

        return view('admin.users.index', compact('users'));
    }

    public function show(User $user)
    {
        Gate::authorize('is-super-admin');

        return view('admin.users.show', compact('user'));
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('is-super-admin');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($request->only('name', 'email', 'is_active'));

        return redirect()->route('admin.users.show', $user)->with('success', 'Utilisateur mis à jour.');
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('is-super-admin');

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Utilisateur supprimé.');
    }

    public function toggle(User $user): RedirectResponse
    {
        Gate::authorize('is-super-admin');

        $user->toggleActive();

        return redirect()->route('admin.users.index')->with('success', 'Statut utilisateur mis à jour.');
    }
}
