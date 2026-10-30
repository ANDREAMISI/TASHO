<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Services\TeamService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
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
    public function index(Request $request)
    {
        $user = $request->user();

        $teams = Team::query()
            ->where('owner_id', $user->id)
            ->orWhereHas('members', fn ($query) => $query->where('users.id', $user->id))
            ->with('owner')
            ->withCount('members')
            ->orderBy('name')
            ->get();

        $currentTeam = $teams->firstWhere('owner_id', $user->id) ?? $teams->first();

        return Inertia::render('Team/Index', [
            'teams' => $teams,
            'currentTeam' => $currentTeam,
            'openCreate' => $request->boolean('create'),
        ]);
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

        $user = $request->user();
        $team = $this->teamService->createTeam($user, $request->name, $request->description);

        return redirect()->route('team.show', $team)
            ->with('success', 'Équipe créée avec succès !');
    }

    /**
     * Afficher une équipe
     */
    public function show(Request $request, Team $team)
    {
        Gate::authorize('view', $team);

        $user = $request->user();

        $team->load(['owner', 'members', 'invitations' => function ($query) {
            $query->where('status', 'pending')->where('expires_at', '>', now());
        }]);

        $members = $team->members
            ->sortBy(fn ($member) => $member->id === $team->owner_id ? 0 : 1)
            ->values()
            ->map(function ($member) use ($team, $user) {
                $canManage = Gate::allows('manageMembers', $team);
                $isActorOwner = $team->isOwner($user) || $user->isSuperAdmin();
                $isSelf = $member->id === $user->id;

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar' => $member->avatar,
                    'role' => $member->pivot->role,
                    'joined_at' => $member->pivot->joined_at,
                    'last_activity_at' => $member->pivot->last_activity_at,
                    'permissions' => $member->pivot->permissions,
                    // Un manager ne peut pas modifier un autre manager ni promouvoir quelqu'un.
                    'can_change_role' => $canManage
                        && $member->pivot->role !== 'owner'
                        && ! $isSelf
                        && ($isActorOwner || $member->pivot->role !== 'manager'),
                    'can_remove' => $canManage
                        && $member->pivot->role !== 'owner'
                        && ! $isSelf
                        && ($isActorOwner || $member->pivot->role !== 'manager'),
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
                'invite_link' => route('invitation.show', $invitation->token),
            ];
        });

        $isOwner = $team->isOwner($user);
        $isSuperAdmin = $user->isSuperAdmin();

        return Inertia::render('Team/Show', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'description' => $team->description,
                'logo' => $team->logo,
                'owner' => $team->owner,
                'is_owner' => $isOwner,
                'is_super_admin' => $isSuperAdmin,
                'current_role' => $team->getMemberRole($user),
                // Seul le propriétaire (ou un super admin) peut nommer des managers.
                'can_assign_manager' => $isOwner || $isSuperAdmin,
            ],
            'members' => $members,
            'invitations' => $pendingInvitations,
            'canManage' => Gate::allows('manageMembers', $team),
            'canInvite' => Gate::allows('invite-team-member', $team),
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
            'role' => ['required', Rule::in(['manager', 'editor', 'viewer'])],
            'permissions' => 'nullable|array',
            'project_access' => 'nullable|array',
        ]);

        $user = $request->user();
        $email = $request->filled('email') ? mb_strtolower(trim($request->email)) : null;

        if ($request->role === 'manager' && ! $this->canAssignManager($team, $user)) {
            return back()->withErrors([
                'role' => 'Seul le propriétaire de l’équipe peut inviter un manager.',
            ]);
        }

        if ($email) {
            $existingUser = User::where('email', $email)->first();

            if ($existingUser && $team->members()->where('user_id', $existingUser->id)->exists()) {
                return back()->withErrors([
                    'email' => 'Cet utilisateur est déjà membre de l’équipe.',
                ]);
            }

            $alreadyInvited = $team->invitations()
                ->where('email', $email)
                ->where('status', 'pending')
                ->where('expires_at', '>', now())
                ->exists();

            if ($alreadyInvited) {
                return back()->withErrors([
                    'email' => 'Une invitation est déjà en attente pour cet email.',
                ]);
            }
        }

        $invitation = $this->teamService->createInvitation(
            $team,
            $user,
            $email,
            $request->role,
            $request->permissions ?? [],
            $request->project_access ?? []
        );

        // Envoyer l'email d'invitation
        if ($email) {
            $this->teamService->sendInvitationEmail($invitation);
        }

        return back()
            ->with('success', 'Invitation créée avec succès !')
            ->with('invite_link', route('invitation.show', $invitation->token));
    }

    /**
     * Ancien point d'entrée des invitations (conservé pour les emails déjà envoyés).
     */
    public function acceptInvitation($token)
    {
        return redirect()->route('invitation.show', $token);
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

        abort_unless($team->hasMember($user), 404);

        if ($team->isOwner($user)) {
            return back()->withErrors([
                'message' => 'Vous ne pouvez pas retirer le propriétaire de l’équipe.',
            ]);
        }

        if ($user->id === $request->user()->id) {
            return back()->withErrors([
                'message' => 'Vous ne pouvez pas vous retirer vous-même de l’équipe.',
            ]);
        }

        $targetRole = $team->getMemberRole($user);

        if (! $this->canAssignManager($team, $request->user()) && $targetRole === 'manager') {
            return back()->withErrors([
                'message' => 'Seul le propriétaire peut retirer un manager.',
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
            'role' => ['required', Rule::in(['manager', 'editor', 'viewer'])],
        ]);

        abort_unless($team->hasMember($user), 404);

        if ($team->isOwner($user)) {
            return back()->withErrors([
                'message' => 'Vous ne pouvez pas modifier le rôle du propriétaire.',
            ]);
        }

        if ($user->id === $request->user()->id) {
            return back()->withErrors([
                'message' => 'Vous ne pouvez pas modifier votre propre rôle.',
            ]);
        }

        $canAssignManager = $this->canAssignManager($team, $request->user());
        $targetRole = $team->getMemberRole($user);

        if (! $canAssignManager && $targetRole === 'manager') {
            return back()->withErrors([
                'message' => 'Seul le propriétaire peut modifier le rôle d’un manager.',
            ]);
        }

        if (! $canAssignManager && $request->role === 'manager') {
            return back()->withErrors([
                'role' => 'Seul le propriétaire peut nommer un manager.',
            ]);
        }

        $team->members()->updateExistingPivot($user->id, [
            'role' => $request->role,
        ]);

        return back()->with('success', 'Rôle mis à jour avec succès !');
    }

    /**
     * Le propriétaire (ou un super admin) peut nommer et gérer les managers.
     */
    private function canAssignManager(Team $team, User $user): bool
    {
        return $team->isOwner($user) || $user->isSuperAdmin();
    }
}
