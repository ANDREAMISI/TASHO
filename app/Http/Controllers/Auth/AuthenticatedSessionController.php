<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Un utilisateur arrivé via un lien d'invitation est renvoyé vers
        // l'invitation pour pouvoir l'accepter.
        if (! auth()->user()->isSuperAdmin() && $request->session()->has('invitation_token')) {
            return redirect()->route('invitation.show', $request->session()->get('invitation_token'));
        }

        // ✅ Redirection vers admin.dashboard si Super Admin
        if (auth()->user()->isSuperAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // Page d'accueil choisie dans les préférences de l'utilisateur.
        $landing = auth()->user()->preferences['default_landing'] ?? 'dashboard';
        $fallback = $landing === 'projects'
            ? route('projects.index', absolute: false)
            : route('dashboard', absolute: false);

        return redirect()->intended($fallback);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
