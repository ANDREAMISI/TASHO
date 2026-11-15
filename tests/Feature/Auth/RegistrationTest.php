<?php

namespace Tests\Feature\Auth;

use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\TeamService;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'profession' => 'Photographe',
            'work_type' => 'alone',
            'storage_volume' => '10GB à 100GB',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_user_registering_with_an_invitation_joins_and_opens_that_team(): void
    {
        $owner = User::factory()->create();
        $team = app(TeamService::class)->createTeam($owner, 'Équipe invitante');
        $invitation = app(TeamService::class)->createInvitation(
            $team,
            $owner,
            null,
            'viewer',
        );

        $response = $this->post('/register', [
            'name' => 'Invited User',
            'email' => 'invited@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'profession' => 'Photographe',
            'work_type' => 'team',
            'storage_volume' => '10GB à 100GB',
            'invitation_token' => $invitation->token,
        ]);

        $user = User::where('email', 'invited@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('team.show', $team));
        $this->assertTrue($team->fresh()->hasMember($user));
        $this->assertSame('accepted', $invitation->fresh()->status);
        $this->assertDatabaseMissing('teams', ['owner_id' => $user->id]);
    }
}
