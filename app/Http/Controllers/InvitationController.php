<?php

namespace App\Http\Controllers;

use App\Models\TeamInvitation;
use App\Models\User;
use App\Services\TeamService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InvitationController extends Controller
{
    protected TeamService $teamService;

    public function __construct(TeamService $teamService)
    {
        $this->teamService = $teamService;
    }

    /**
     * Afficher la page d'invitation
     */
    public function show($token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return Inertia::render('Invitation/Invalid', [
                'message' => 'Cette invitation n\'existe pas ou a déjà été utilisée.',
            ]);
        }

        if ($invitation->isExpired()) {
            $invitation->update(['status' => 'expired']);
            
            return Inertia::render('Invitation/Expired', [
                'invitation' => $invitation,
            ]);
        }

        $invitation->load(['team', 'invitedBy']);
        $user = Auth::user();

        return Inertia::render('Invitation/Show', [
            'invitation' => [
                'id' => $invitation->id,
                'token' => $invitation->token,
                'team' => $invitation->team,
                'invited_by' => $invitation->invitedBy,
                'role' => $invitation->role,
                'expires_at' => $invitation->expires_at,
                'email' => $invitation->email,
            ],
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
            'hasAccount' => !!$user,
        ]);
    }

    /**
     * Accepter l'invitation (utilisateur connecté)
     */
    public function accept($token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->where('status', 'pending')
            ->firstOrFail();

        if ($invitation->isExpired()) {
            $invitation->update(['status' => 'expired']);
            
            return redirect()->route('invitation.show', $token)
                ->withErrors(['message' => 'Cette invitation a expiré.']);
        }

        $user = Auth::user();

        if (!$user) {
            session(['invitation_token' => $token]);
            return redirect()->route('login');
        }

        // Vérifier si l'invitation correspond à l'email de l'utilisateur
        if ($invitation->email && $invitation->email !== $user->email) {
            return redirect()->route('invitation.show', $token)
                ->withErrors(['message' => 'Cette invitation ne correspond pas à votre email.']);
        }

        // Vérifier si l'utilisateur est déjà membre
        if ($invitation->team->members()->where('user_id', $user->id)->exists()) {
            return redirect()->route('team.show', $invitation->team)
                ->with('info', 'Vous êtes déjà membre de cette équipe.');
        }

        // Accepter l'invitation
        $this->teamService->acceptInvitation($invitation, $user);

        return redirect()->route('team.show', $invitation->team)
            ->with('success', 'Vous avez rejoint l\'équipe avec succès !');
    }

    /**
     * Accepter l'invitation après inscription
     */
    public function acceptAfterRegistration(Request $request)
    {
        $token = session('invitation_token');

        if (!$token) {
            return redirect()->route('dashboard');
        }

        $invitation = TeamInvitation::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invitation || $invitation->isExpired()) {
            session()->forget('invitation_token');
            return redirect()->route('dashboard')
                ->withErrors(['message' => 'L\'invitation n\'est plus valide.']);
        }

        $user = Auth::user();

        // Vérifier si l'invitation correspond à l'email de l'utilisateur
        if ($invitation->email && $invitation->email !== $user->email) {
            session()->forget('invitation_token');
            return redirect()->route('dashboard')
                ->withErrors(['message' => 'Cette invitation ne correspond pas à votre email.']);
        }

        // Accepter l'invitation
        $this->teamService->acceptInvitation($invitation, $user);
        session()->forget('invitation_token');

        return redirect()->route('team.show', $invitation->team)
            ->with('success', 'Vous avez rejoint l\'équipe avec succès !');
    }

    /**
     * Refuser l'invitation
     */
    public function decline($token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->where('status', 'pending')
            ->firstOrFail();

        $invitation->update(['status' => 'cancelled']);

        return Inertia::render('Invitation/Declined', [
            'invitation' => $invitation,
        ]);
    }

    /**
     * Générer un lien d'invitation (API)
     */
    public function generateLink(Request $request)
    {
        $request->validate([
            'team_id' => 'required|exists:teams,id',
            'role' => 'required|in:manager,editor,viewer',
        ]);

        $team = Team::findOrFail($request->team_id);
        $user = Auth::user();

        // Vérifier les permissions
        if (!Gate::allows('invite-team-member', $team)) {
            abort(403, 'Vous n\'avez pas la permission d\'inviter des membres.');
        }

        $invitation = $this->teamService->createInvitation(
            $team,
            $user,
            null, // Pas d'email
            $request->role,
            $request->permissions ?? [],
            $request->project_access ?? []
        );

        return response()->json([
            'link' => route('invitation.show', $invitation->token),
            'token' => $invitation->token,
            'expires_at' => $invitation->expires_at,
        ]);
    }
}