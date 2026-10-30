<?php

namespace Tests\Feature;

use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\TeamService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeamManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
    }

    private function makeTeam(User $owner, string $name = 'Studio Amisi'): Team
    {
        $team = Team::create([
            'name' => $name,
            'owner_id' => $owner->id,
            'description' => 'Équipe de test',
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return $team;
    }

    private function addMember(Team $team, User $user, string $role = 'viewer'): void
    {
        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'role' => $role,
            'joined_at' => now(),
        ]);
    }

    public function test_index_only_lists_teams_the_user_belongs_to(): void
    {
        $user = User::factory()->create();
        $stranger = User::factory()->create();

        $ownedTeam = $this->makeTeam($user, 'Équipe possédée');
        $joinedTeam = $this->makeTeam($stranger, 'Équipe rejointe');
        $this->addMember($joinedTeam, $user);
        $this->makeTeam($stranger, 'Équipe privée');

        $response = $this->actingAs($user)->get('/team');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Team/Index')
            ->has('teams', 2)
            ->where('currentTeam.id', $ownedTeam->id)
            ->has('teams.0.members_count')
        );
    }

    public function test_user_can_create_a_team_and_becomes_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/team', [
            'name' => 'Nouvelle équipe',
            'description' => 'Description',
        ]);

        $team = Team::where('name', 'Nouvelle équipe')->firstOrFail();

        $response->assertRedirect(route('team.show', $team));
        $this->assertTrue($team->isOwner($user));
        $this->assertTrue($team->hasMember($user));
        $this->assertSame('owner', $team->getMemberRole($user));
    }

    public function test_non_member_cannot_view_a_team(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $team = $this->makeTeam($owner);

        $this->actingAs($intruder)
            ->get(route('team.show', $team))
            ->assertForbidden();
    }

    public function test_only_the_owner_can_update_a_team(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');

        $this->actingAs($manager)
            ->put(route('team.update', $team), ['name' => 'Renommée'])
            ->assertForbidden();

        $this->actingAs($owner)
            ->put(route('team.update', $team), ['name' => 'Renommée'])
            ->assertRedirect();

        $this->assertSame('Renommée', $team->fresh()->name);
    }

    public function test_only_the_owner_can_delete_a_team(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');

        $this->actingAs($manager)
            ->delete(route('team.destroy', $team))
            ->assertForbidden();

        $this->assertNotNull($team->fresh());

        $this->actingAs($owner)
            ->delete(route('team.destroy', $team))
            ->assertRedirect(route('team.index'));

        $this->assertNull($team->fresh());
    }

    public function test_owner_can_invite_a_member_by_email(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);

        $response = $this->actingAs($owner)->post(route('team.invite', $team), [
            'email' => 'Invite@Example.com',
            'role' => 'editor',
        ]);

        $response->assertSessionHasNoErrors();

        $invitation = TeamInvitation::firstOrFail();
        $this->assertSame('invite@example.com', $invitation->email);
        $this->assertSame('editor', $invitation->role);
        $this->assertSame('pending', $invitation->status);

        Mail::assertSent(TeamInvitationMail::class, function (TeamInvitationMail $mail) use ($invitation) {
            return $mail->hasTo($invitation->email)
                && str_contains($mail->render(), route('invitation.show', $invitation->token));
        });
    }

    public function test_duplicate_pending_invitation_is_rejected(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);

        $payload = ['email' => 'invite@example.com', 'role' => 'viewer'];

        $this->actingAs($owner)->post(route('team.invite', $team), $payload);
        $response = $this->actingAs($owner)->post(route('team.invite', $team), $payload);

        $response->assertSessionHasErrors('email');
        $this->assertSame(1, TeamInvitation::count());
    }

    public function test_cannot_invite_an_existing_member(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create(['email' => 'member@example.com']);
        $team = $this->makeTeam($owner);
        $this->addMember($team, $member);

        $this->actingAs($owner)
            ->post(route('team.invite', $team), [
                'email' => 'member@example.com',
                'role' => 'viewer',
            ])
            ->assertSessionHasErrors('email');

        $this->assertSame(0, TeamInvitation::count());
    }

    public function test_only_the_owner_can_invite_a_manager(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');

        $this->actingAs($manager)
            ->post(route('team.invite', $team), [
                'email' => 'new-manager@example.com',
                'role' => 'manager',
            ])
            ->assertSessionHasErrors('role');

        $this->assertSame(0, TeamInvitation::count());
    }

    public function test_invitation_link_can_be_generated(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);

        $response = $this->actingAs($owner)->postJson(route('invitation.generate-link'), [
            'team_id' => $team->id,
            'role' => 'viewer',
        ]);

        $response->assertOk()->assertJsonStructure(['link', 'token', 'expires_at']);

        $invitation = TeamInvitation::firstOrFail();
        $this->assertNull($invitation->email);
        $this->assertStringContainsString($invitation->token, $response->json('link'));
    }

    public function test_a_stranger_cannot_generate_an_invitation_link(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $team = $this->makeTeam($owner);

        $this->actingAs($stranger)
            ->postJson(route('invitation.generate-link'), [
                'team_id' => $team->id,
                'role' => 'viewer',
            ])
            ->assertForbidden();
    }

    public function test_guest_invited_by_email_can_accept_after_login(): void
    {
        $owner = User::factory()->create();
        $guest = User::factory()->create(['email' => 'invite@example.com']);
        $team = $this->makeTeam($owner);

        $invitation = app(TeamService::class)->createInvitation(
            $team,
            $owner,
            'invite@example.com',
            'editor',
        );

        $this->actingAs($guest)
            ->post(route('invitation.accept', $invitation->token))
            ->assertRedirect(route('team.show', $team));

        $this->assertTrue($team->hasMember($guest));
        $this->assertSame('editor', $team->getMemberRole($guest));
        $this->assertSame('accepted', $invitation->fresh()->status);
    }

    public function test_guest_is_redirected_to_login_before_accepting(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);
        $invitation = app(TeamService::class)->createInvitation($team, $owner, null, 'viewer');

        $this->post(route('invitation.accept', $invitation->token))
            ->assertRedirect(route('login'));

        $this->assertSame($invitation->token, session('invitation_token'));
        $this->assertSame(0, $team->members()->where('role', 'viewer')->count());
    }

    public function test_invitation_cannot_be_accepted_with_another_email(): void
    {
        $owner = User::factory()->create();
        $wrongUser = User::factory()->create(['email' => 'other@example.com']);
        $team = $this->makeTeam($owner);
        $invitation = app(TeamService::class)->createInvitation(
            $team,
            $owner,
            'invite@example.com',
            'viewer',
        );

        $this->actingAs($wrongUser)
            ->from(route('invitation.show', $invitation->token))
            ->post(route('invitation.accept', $invitation->token))
            ->assertRedirect(route('invitation.show', $invitation->token))
            ->assertSessionHasErrors('message');

        $this->assertFalse($team->hasMember($wrongUser));
        $this->assertSame('pending', $invitation->fresh()->status);
    }

    public function test_expired_invitation_cannot_be_accepted(): void
    {
        $owner = User::factory()->create();
        $guest = User::factory()->create(['email' => 'invite@example.com']);
        $team = $this->makeTeam($owner);
        $invitation = app(TeamService::class)->createInvitation(
            $team,
            $owner,
            'invite@example.com',
            'viewer',
        );
        $invitation->update(['expires_at' => now()->subDay()]);

        $this->actingAs($guest)
            ->post(route('invitation.accept', $invitation->token))
            ->assertRedirect(route('invitation.show', $invitation->token));

        $this->assertFalse($team->hasMember($guest));
        $this->assertSame('expired', $invitation->fresh()->status);

        $this->get(route('invitation.show', $invitation->token))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Invitation/Expired'));
    }

    public function test_owner_can_change_the_role_of_a_member(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $member, 'viewer');

        $this->actingAs($owner)
            ->put(route('team.update-role', [$team, $member]), ['role' => 'editor'])
            ->assertSessionHasNoErrors();

        $this->assertSame('editor', $team->getMemberRole($member));
    }

    public function test_owner_role_cannot_be_changed(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);

        $this->actingAs($owner)
            ->put(route('team.update-role', [$team, $owner]), ['role' => 'viewer'])
            ->assertSessionHasErrors('message');

        $this->assertSame('owner', $team->getMemberRole($owner));
    }

    public function test_member_cannot_change_their_own_role(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');

        $this->actingAs($manager)
            ->put(route('team.update-role', [$team, $manager]), ['role' => 'viewer'])
            ->assertSessionHasErrors('message');

        $this->assertSame('manager', $team->getMemberRole($manager));
    }

    public function test_manager_cannot_change_another_manager_role(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $otherManager = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');
        $this->addMember($team, $otherManager, 'manager');

        $this->actingAs($manager)
            ->put(route('team.update-role', [$team, $otherManager]), ['role' => 'viewer'])
            ->assertSessionHasErrors('message');

        $this->assertSame('manager', $team->getMemberRole($otherManager));
    }

    public function test_manager_cannot_promote_a_member_to_manager(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');
        $this->addMember($team, $member, 'viewer');

        $this->actingAs($manager)
            ->put(route('team.update-role', [$team, $member]), ['role' => 'manager'])
            ->assertSessionHasErrors('role');

        $this->assertSame('viewer', $team->getMemberRole($member));
    }

    public function test_manager_can_change_an_editor_role(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $editor = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');
        $this->addMember($team, $editor, 'editor');

        $this->actingAs($manager)
            ->put(route('team.update-role', [$team, $editor]), ['role' => 'viewer'])
            ->assertSessionHasNoErrors();

        $this->assertSame('viewer', $team->getMemberRole($editor));
    }

    public function test_owner_cannot_be_removed_from_the_team(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);

        $this->actingAs($owner)
            ->delete(route('team.remove-member', [$team, $owner]))
            ->assertSessionHasErrors('message');

        $this->assertTrue($team->hasMember($owner));
    }

    public function test_manager_can_remove_an_editor_but_not_another_manager(): void
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $editor = User::factory()->create();
        $otherManager = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');
        $this->addMember($team, $editor, 'editor');
        $this->addMember($team, $otherManager, 'manager');

        $this->actingAs($manager)
            ->delete(route('team.remove-member', [$team, $editor]))
            ->assertSessionHasNoErrors();

        $this->assertFalse($team->hasMember($editor));

        $this->actingAs($manager)
            ->delete(route('team.remove-member', [$team, $otherManager]))
            ->assertSessionHasErrors('message');

        $this->assertTrue($team->hasMember($otherManager));
    }

    public function test_owner_can_cancel_a_pending_invitation(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);
        $invitation = app(TeamService::class)->createInvitation($team, $owner, null, 'viewer');

        $this->actingAs($owner)
            ->delete(route('team.cancel-invitation', $invitation))
            ->assertSessionHasNoErrors();

        $this->assertSame('cancelled', $invitation->fresh()->status);
    }

    public function test_guest_viewing_an_invitation_link_keeps_the_token_for_later(): void
    {
        $owner = User::factory()->create();
        $team = $this->makeTeam($owner);
        $invitation = app(TeamService::class)->createInvitation($team, $owner, null, 'viewer');

        $this->get(route('invitation.show', $invitation->token))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Invitation/Show')
                ->where('hasAccount', false)
            );

        $this->assertSame($invitation->token, session('invitation_token'));
    }
}
