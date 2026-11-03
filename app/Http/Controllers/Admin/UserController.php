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
        if (! Auth::check() || ! Auth::user()->isSuperAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }

    public function index(Request $request)
    {
        $this->checkSuperAdmin();

        $query = User::query();
        $search = trim((string) $request->input('search', ''));

        if ($search !== '') {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('profession', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%');
            });
        }

        $users = $query->orderByDesc('created_at')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => ['search' => $search],
        ]);
    }

    public function show(User $user)
    {
        $this->checkSuperAdmin();

        $user->loadCount(['projects', 'files', 'teams', 'comments', 'subscriptions'])
            ->load([
                'teams:id,name,owner_id,is_active',
                'subscriptions.plan:id,name,slug',
            ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->checkSuperAdmin();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
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
