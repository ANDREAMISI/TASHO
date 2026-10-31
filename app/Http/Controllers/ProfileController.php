<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                && ! $user->hasVerifiedEmail(),
            'stats' => [
                'projects' => $user->projects()->count(),
                'files' => $user->files()->count(),
                'storage' => (int) $user->files()->sum('size'),
                'teams' => $user->teams()->count(),
            ],
            'memberSince' => $user->created_at?->toIso8601String(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('success', 'Profil mis à jour avec succès.');
    }

    /**
     * Enregistrer la photo de profil (image déjà recadrée côté client).
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $user = $request->user();
        $previous = $user->avatar;
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->forceFill(['avatar' => $path])->save();

        if ($previous && $previous !== $path) {
            Storage::disk('public')->delete($previous);
        }

        return Redirect::route('profile.edit')->with('success', 'Photo de profil mise à jour.');
    }

    /**
     * Supprimer la photo de profil.
     */
    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->forceFill(['avatar' => null])->save();
        }

        return Redirect::route('profile.edit')->with('success', 'Photo de profil supprimée.');
    }

    /**
     * Servir la photo de profil (évite de dépendre du lien symbolique public/storage).
     */
    public function showAvatar(User $user): StreamedResponse
    {
        abort_unless($user->avatar && Storage::disk('public')->exists($user->avatar), 404);

        return Storage::disk('public')->response($user->avatar, null, [
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
