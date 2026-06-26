<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Pour commencer',
                'storage_limit' => 1073741824, // 1GB
                'max_team_members' => 1,
                'max_projects' => 3,
                'max_file_size' => 52428800, // 50MB
                'features' => json_encode(['basic_storage' => true]),
                'price_monthly' => 0,
                'price_yearly' => 0,
                'sort_order' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Pour les freelances',
                'storage_limit' => 10737418240, // 10GB
                'max_team_members' => 3,
                'max_projects' => -1,
                'max_file_size' => 524288000, // 500MB
                'features' => json_encode([
                    'basic_storage' => true,
                    'client_sharing' => true,
                    'comments' => true,
                ]),
                'price_monthly' => 19.99,
                'price_yearly' => 199.99,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Pour les studios créatifs',
                'storage_limit' => 536870912000, // 500GB
                'max_team_members' => 15,
                'max_projects' => -1,
                'max_file_size' => 2147483648, // 2GB
                'features' => json_encode([
                    'basic_storage' => true,
                    'client_sharing' => true,
                    'comments' => true,
                    'team_collaboration' => true,
                    'advanced_permissions' => true,
                    'audit_logs' => true,
                ]),
                'price_monthly' => 49.99,
                'price_yearly' => 499.99,
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Studio',
                'slug' => 'studio',
                'description' => 'Pour les grandes agences',
                'storage_limit' => 1073741824000, // 1TB
                'max_team_members' => -1,
                'max_projects' => -1,
                'max_file_size' => 5368709120, // 5GB
                'features' => json_encode([
                    'basic_storage' => true,
                    'client_sharing' => true,
                    'comments' => true,
                    'team_collaboration' => true,
                    'advanced_permissions' => true,
                    'audit_logs' => true,
                    'priority_support' => true,
                    'api_access' => true,
                    'custom_branding' => true,
                ]),
                'price_monthly' => 99.99,
                'price_yearly' => 999.99,
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            DB::table('plans')->insert($plan);
        }
    }
}