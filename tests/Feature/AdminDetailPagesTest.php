<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDetailPagesTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['email' => 'admin@tasho.com']);
    }

    public function test_super_admin_can_open_details_for_any_user_including_the_admin_account(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create();
        $team = Team::create([
            'name' => 'Studio de test',
            'owner_id' => $user->id,
        ]);
        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        foreach ([$admin, $user] as $target) {
            $this->actingAs($admin)
                ->get(route('admin.users.show', $target))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Admin/Users/Show')
                    ->where('user.id', $target->id)
                    ->has('user.projects_count')
                    ->has('user.files_count')
                    ->has('user.teams_count')
                    ->has('user.comments_count')
                    ->has('user.subscriptions_count')
                    ->has('user.teams')
                    ->has('user.subscriptions')
                );
        }
    }

    public function test_super_admin_can_open_plan_details(): void
    {
        $admin = $this->admin();
        $plan = Plan::create([
            'name' => 'Starter',
            'slug' => 'starter',
            'description' => 'Plan de test',
            'storage_limit' => 10737418240,
            'max_team_members' => 3,
            'max_projects' => -1,
            'max_file_size' => 524288000,
            'features' => ['team' => true],
            'price_monthly' => 30000,
            'price_yearly' => 300000,
            'currency' => 'FBU',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.plans.show', $plan))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Plans/Show')
                ->where('plan.id', $plan->id)
                ->where('plan.subscriptions_count', 0)
                ->where('plan.price_monthly_formatted', '30 000 FBU')
                ->has('plan.subscriptions', 0)
            );
    }

    public function test_super_admin_can_search_users_by_name_email_profession_or_phone(): void
    {
        $admin = $this->admin();
        $matchingUser = User::factory()->create([
            'name' => 'Gael Brian',
            'email' => 'gael@example.com',
            'profession' => 'Photographe',
            'phone' => '+25770000000',
        ]);
        User::factory()->create([
            'name' => 'Autre utilisateur',
            'email' => 'other@example.com',
        ]);

        foreach (['Gael', 'gael@example.com', 'Photographe', '70000000'] as $term) {
            $this->actingAs($admin)
                ->get(route('admin.users.index', ['search' => $term]))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Admin/Users/Index')
                    ->where('filters.search', $term)
                    ->has('users.data', 1)
                    ->where('users.data.0.id', $matchingUser->id)
                );
        }
    }
}
