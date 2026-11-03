<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSubscriptionManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['email' => 'admin@tasho.com']);
    }

    private function subscriptionOwner(): array
    {
        $user = User::factory()->create();
        $team = Team::create([
            'name' => 'Équipe de test',
            'owner_id' => $user->id,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return [$user, $team];
    }

    private function plan(array $attributes = []): Plan
    {
        return Plan::create(array_merge([
            'name' => 'Starter',
            'slug' => 'starter',
            'price_monthly' => 12000,
            'price_yearly' => 120000,
            'currency' => 'FBU',
            'is_active' => true,
        ], $attributes));
    }

    public function test_admin_subscription_uses_cycle_to_calculate_end_date_and_saves_payment_details(): void
    {
        $admin = $this->admin();
        [$user] = $this->subscriptionOwner();
        $plan = $this->plan(['currency' => 'USD']);

        $response = $this->actingAs($admin)->post(route('admin.subscriptions.store'), [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'start_date' => '2025-01-31',
            'amount' => 15000,
            'currency' => '',
            'payment_method' => 'Mobile Money',
            'notes' => 'Test de paiement',
        ]);

        $response->assertRedirect(route('admin.subscriptions.index'));

        $subscription = Subscription::firstOrFail();
        $this->assertSame('2025-02-28', $subscription->end_date->toDateString());
        $this->assertSame('USD', $subscription->currency);
        $this->assertSame('Mobile Money', $subscription->payment_method);
        $this->assertSame(15000, $subscription->amount);
    }

    public function test_updating_subscription_recalculates_its_end_date_for_a_yearly_cycle(): void
    {
        $admin = $this->admin();
        [$user, $team] = $this->subscriptionOwner();
        $plan = $this->plan();
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'team_id' => $team->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'start_date' => '2024-01-01',
            'end_date' => '2024-02-01',
            'amount' => 12000,
            'currency' => 'FBU',
        ]);

        $response = $this->actingAs($admin)->put(
            route('admin.subscriptions.update', $subscription),
            [
                'plan_id' => $plan->id,
                'status' => 'active',
                'billing_cycle' => 'yearly',
                'start_date' => '2024-02-29',
                'amount' => 120000,
                'currency' => 'BIF',
                'payment_method' => 'Virement',
            ],
        );

        $response->assertRedirect(route('admin.subscriptions.index'));
        $subscription->refresh();
        $this->assertSame('2025-02-28', $subscription->end_date->toDateString());
        $this->assertSame('BIF', $subscription->currency);
        $this->assertSame('Virement', $subscription->payment_method);
    }

    public function test_admin_can_update_plan_prices_and_optional_currency(): void
    {
        $admin = $this->admin();
        $plan = $this->plan();

        $response = $this->actingAs($admin)->put(route('admin.plans.update', $plan), [
            'name' => $plan->name,
            'slug' => $plan->slug,
            'description' => '',
            'storage_limit' => 1073741824,
            'max_team_members' => 3,
            'max_projects' => -1,
            'max_file_size' => 52428800,
            'price_monthly' => 22000,
            'price_yearly' => 220000,
            'currency' => '',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $response->assertRedirect(route('admin.plans.index'));
        $plan->refresh();
        $this->assertSame(22000, $plan->price_monthly);
        $this->assertSame(220000, $plan->price_yearly);
        $this->assertSame('FBU', $plan->currency);
    }

    public function test_admin_can_create_a_plan_with_optional_currency(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->post(route('admin.plans.store'), [
            'name' => 'Business',
            'slug' => 'business',
            'description' => '',
            'storage_limit' => 10737418240,
            'max_team_members' => 10,
            'max_projects' => -1,
            'max_file_size' => 524288000,
            'price_monthly' => 25000,
            'price_yearly' => 250000,
            'currency' => '',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $response->assertRedirect(route('admin.plans.index'));
        $this->assertDatabaseHas('plans', [
            'slug' => 'business',
            'price_monthly' => 25000,
            'price_yearly' => 250000,
            'currency' => 'FBU',
        ]);
    }
}
