<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\TeamInvitation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'professions' => [
                'Photographe',
                'Vidéaste',
                'Cinéaste',
                'Graphiste',
                'Motion designer',
                'Autre',
            ],
            'workTypes' => [
                'alone' => 'Je travaille seul',
                'team' => 'Je travaille en équipe',
            ],
            'storageVolumes' => [
                'moins de 10GB',
                '10GB à 100GB',
                '100GB à 1TB',
                'plus de 1TB',
            ],
            'invitationToken' => session('invitation_token'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'profession' => 'required|string|max:100',
            'work_type' => 'required|in:alone,team',
            'storage_volume' => 'required|string|max:50',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'country' => $request->country,
            'profession' => $request->profession,
            'work_type' => $request->work_type,
            'storage_volume' => $request->storage_volume,
            'email_verified_at' => now(),
        ]);

        // Vérifier si l'utilisateur vient d'une invitation
        $invitationToken = $request->input('invitation_token') ?? session('invitation_token');
        
        if ($invitationToken) {
            $invitation = TeamInvitation::where('token', $invitationToken)
                ->where('status', 'pending')
                ->first();

            if ($invitation && !$invitation->isExpired()) {
                // Ajouter l'utilisateur à l'équipe
                TeamMember::create([
                    'team_id' => $invitation->team_id,
                    'user_id' => $user->id,
                    'role' => $invitation->role,
                    'permissions' => $invitation->permissions,
                    'joined_at' => now(),
                ]);

                $invitation->update(['status' => 'accepted']);
                session()->forget('invitation_token');
            }
        }

        // Si l'utilisateur n'a pas été ajouté à une équipe via invitation
        if (!$invitationToken || !isset($invitation) || !$invitation) {
            // Créer une équipe par défaut
            $team = Team::create([
                'name' => 'Mon Espace',
                'owner_id' => $user->id,
                'description' => 'Mon espace de travail TASHO',
            ]);

            TeamMember::create([
                'team_id' => $team->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'joined_at' => now(),
            ]);
        }

        event(new Registered($user));
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}