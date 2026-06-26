<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\TeamService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeamController extends Controller
{
    protected TeamService $teamService;

    public function __construct(TeamService $teamService)
    {
        $this->teamService = $teamService;
    }

    /**
     * Afficher la liste des équipes
     */
    public function index()
    {
        $user = auth()->user();
        $teams = $user->teams()->with('owner')->get();
        $currentTeam = $user->teams()->first();

        return Inertia::render('Team/Index', [
            'teams' => $teams,
            'currentTeam' => $currentTeam,
        ]);
    }

    /**
     * Afficher le formulaire de création d'équipe
     */
    public function create()
    {
        return Inertia::render('Team/Create');
    }

    /**
     * Créer une nouvelle équipe
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $team = $this->teamService->createTeam($user, $request->name, $request->description);

        return redirect()->route('team.show', $team)
            ->with('success', 'Équipe créée avec succès !');
    }

    /**
     * Afficher une équipe
     */
    public function show(Team $team)
    {
        Gate::authorize('view', $team);

        $team->load(['owner', 'members', 'invitations' => function ($query) {
            $query->where('status', 'pending');
        }]);

        $members = $team->members->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'avatar' => $member->avatar,
                'role' => $member->pivot->role,
                'joined_at' => $member->pivot->joined_at,
                'last_activity_at' => $member->pivot->last_activity_at,
                'permissions' => $member->pivot->permissions,
            ];
        });

        $pendingInvitations = $team->invitations->map(function ($invitation) {
            return [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'token' => $invitation->token,
                'expires_at' => $invitation->expires_at,
                'created_at' => $invitation->created_at,
                'invite_link' => route('team.accept-invitation', $invitation->token),
            ];
        });

        $canManage = Gate::allows('manageMembers', $team);
        $canInvite = Gate::allows('invite-team-member', $team);

        return Inertia::render('Team/Show', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'description' => $team->description,
                'logo' => $team->logo,
                'owner' => $team->owner,
                'is_owner' => $team->owner_id === auth()->id(),
            ],
            'members' => $members,
            'invitations' => $pendingInvitations,
            'canManage' => $canManage,
            'canInvite' => $canInvite,
        ]);
    }

    /**
     * Mettre à jour une équipe
     */
    public function update(Request $request, Team $team)
    {
        Gate::authorize('update', $team);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $team->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return back()->with('success', 'Équipe mise à jour avec succès !');
    }

    /**
     * Supprimer une équipe
     */
    public function destroy(Team $team)
    {
        Gate::authorize('delete', $team);

        $team->delete();

        return redirect()->route('team.index')
            ->with('success', 'Équipe supprimée avec succès !');
    }

    /**
     * Inviter un membre dans l'équipe
     */
    public function invite(Request $request, Team $team)
    {
        Gate::authorize('invite-team-member', $team);

        $request->validate([
            'email' => 'nullable|email|max:255',
            'role' => 'required|in:manager,editor,viewer',
            'permissions' => 'nullable|array',
            'project_access' => 'nullable|array',
        ]);

        // Vérifier si l'utilisateur existe déjà
        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser && $team->members()->where('user_id', $existingUser->id)->exists()) {
            return back()->withErrors([
                'email' => 'Cet utilisateur est déjà membre de l\'équipe.'
            ]);
        }

        $invitation = $this->teamService->createInvitation(
            $team,
            auth()->user(),
            $request->email,
            $request->role,
            $request->permissions ?? [],
            $request->project_access ?? []
        );

        // Envoyer l'email d'invitation
        if ($request->email) {
            $this->teamService->sendInvitationEmail($invitation);
        }

        return back()->with('success', 'Invitation créée avec succès !');
    }

    /**
     * Accepter une invitation
     */
    public function acceptInvitation($token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->where('status', 'pending')
            ->firstOrFail();

        if ($invitation->isExpired()) {
            $invitation->update(['status' => 'expired']);
            
            return Inertia::render('Team/InvitationExpired', [
                'invitation' => $invitation,
            ]);
        }

        $user = auth()->user();

        // Si l'utilisateur n'est pas connecté
        if (!$user) {
            session(['invitation_token' => $token]);
            return redirect()->route('login');
        }

        // Vérifier si l'invitation correspond à l'email de l'utilisateur
        if ($invitation->email && $invitation->email !== $user->email) {
            return Inertia::render('Team/InvitationError', [
                'message' => 'Cette invitation ne correspond pas à votre email.',
            ]);
        }

        // Vérifier si l'utilisateur est déjà membre
        if ($invitation->team->members()->where('user_id', $user->id)->exists()) {
            return Inertia::render('Team/InvitationError', [
                'message' => 'Vous êtes déjà membre de cette équipe.',
            ]);
        }

        // Accepter l'invitation
        $this->teamService->acceptInvitation($invitation, $user);

        return redirect()->route('team.show', $invitation->team)
            ->with('success', 'Vous avez rejoint l\'équipe avec succès !');
    }

    /**
     * Annuler une invitation
     */
    public function cancelInvitation(TeamInvitation $invitation)
    {
        Gate::authorize('manageMembers', $invitation->team);

        $invitation->update(['status' => 'cancelled']);

        return back()->with('success', 'Invitation annulée avec succès !');
    }

    /**
     * Supprimer un membre de l'équipe
     */
    public function removeMember(Request $request, Team $team, User $user)
    {
        Gate::authorize('manageMembers', $team);

        // Empêcher la suppression du propriétaire
        if ($team->owner_id === $user->id) {
            return back()->withErrors([
                'message' => 'Vous ne pouvez pas retirer le propriétaire de l\'équipe.'
            ]);
        }

        $team->members()->detach($user->id);

        return back()->with('success', 'Membre retiré avec succès !');
    }

    /**
     * Mettre à jour le rôle d'un membre
     */
    public function updateRole(Request $request, Team $team, User $user)
    {
        Gate::authorize('manageMembers', $team);

        $request->validate([
            'role' => 'required|in:manager,editor,viewer',
        ]);

        // Empêcher la modification du rôle du propriétaire
        if ($team->owner_id === $user->id) {
            return back()->withErrors([
                'message' => 'Vous ne pouvez pas modifier le rôle du propriétaire.'
            ]);
        }

        $team->members()->updateExistingPivot($user->id, [
            'role' => $request->role,
        ]);

        return back()->with('success', 'Rôle mis à jour avec succès !');
    }

    /**
     * Générer un lien d'invitation
     */
    public function generateInviteLink(Request $request, Team $team)
    {
        Gate::authorize('invite-team-member', $team);

        $request->validate([
            'role' => 'required|in:manager,editor,viewer',
        ]);

        $invitation = $this->teamService->createInvitation(
            $team,
            auth()->user(),
            null, // Pas d'email (lien public)
            $request->role,
            [],
            []
        );

        return response()->json([
            'link' => route('team.accept-invitation', $invitation->token),
            'token' => $invitation->token,
        ]);
    }
}