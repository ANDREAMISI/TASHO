<?php

namespace Tests\Feature;

use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPlansDisplayTest extends TestCase
{
    use RefreshDatabase;

    private function createPlan(array $attributes = []): Plan
    {
        return Plan::create(array_merge([
            'name' => 'Starter',
            'slug' => 'starter',
            'description' => 'Pour les freelances',
            'storage_limit' => 10737418240,
            'max_team_members' => 3,
            'max_projects' => -1,
            'max_file_size' => 524288000,
            'features' => [
                'stockage_base' => true,
                'partage_client' => true,
                'audit' => false,
            ],
            'price_monthly' => 30000,
            'price_yearly' => 300000,
            'currency' => 'FBU',
            'is_active' => true,
            'sort_order' => 1,
        ], $attributes));
    }

    public function test_the_pricing_page_lists_active_plans_from_the_database(): void
    {
        $this->createPlan();

        $this->get('/pricing')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Pricing')
                ->has('plans', 1)
                ->where('plans.0.name', 'Starter')
                ->where('plans.0.storage_human', '10 GB')
                ->where('plans.0.price_monthly_formatted', '30 000 FBU')
                ->where('plans.0.features.0.name', 'Stockage')
                ->where('plans.0.features.0.value', '10 GB'));
    }

    public function test_the_home_page_lists_active_plans_from_the_database(): void
    {
        $this->createPlan();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('plans', 1)
                ->where('plans.0.slug', 'starter'));
    }

    public function test_inactive_plans_are_hidden_from_public_pages(): void
    {
        $this->createPlan(['is_active' => false]);

        $this->get('/pricing')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Pricing')
                ->has('plans', 0));
    }
}
