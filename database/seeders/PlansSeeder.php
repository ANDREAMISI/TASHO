<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlansSeeder extends Seeder
{
    public function run(): void
    {

        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Pour découvrir TASHO - Essai gratuit de 7 jours',
                'storage_limit' => 1073741824, // 1 Go en bytes
                'max_team_members' => 1,
                'max_projects' => 3,
                'max_file_size' => 52428800, // 50 Mo
                'features' => json_encode([
                    'stockage_base' => true,
                    'partage_client' => false,
                    'commentaires' => false,
                    'equipe' => false,
                    'audit' => false,
                ]),
                'price_monthly' => 0,
                'price_yearly' => 0,
                'currency' => 'FBU',
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Pour les freelances et petites structures',
                'storage_limit' => 10737418240, // 10 Go
                'max_team_members' => 3,
                'max_projects' => -1, // Illimité
                'max_file_size' => 524288000, // 500 Mo
                'features' => json_encode([
                    'stockage_base' => true,
                    'partage_client' => true,
                    'commentaires' => true,
                    'equipe' => true,
                    'audit' => false,
                    'support_email' => true,
                ]),
                'price_monthly' => 30000,
                'price_yearly' => 300000, // 30 000 * 10 (réduction)
                'currency' => 'FBU',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Pour les équipes et studios créatifs',
                'storage_limit' => 107374182400, // 100 Go
                'max_team_members' => 10,
                'max_projects' => -1, // Illimité
                'max_file_size' => 1073741824, // 1 Go
                'features' => json_encode([
                    'stockage_base' => true,
                    'partage_client' => true,
                    'commentaires' => true,
                    'equipe' => true,
                    'audit' => true,
                    'support_email' => true,
                    'permissions_avancees' => true,
                    'api_access' => false,
                ]),
                'price_monthly' => 60000,
                'price_yearly' => 600000, // 60 000 * 10
                'currency' => 'FBU',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Pour les grandes agences et entreprises',
                'storage_limit' => 1099511627776, // 1 To
                'max_team_members' => -1, // Illimité
                'max_projects' => -1, // Illimité
                'max_file_size' => 5368709120, // 5 Go
                'features' => json_encode([
                    'stockage_base' => true,
                    'partage_client' => true,
                    'commentaires' => true,
                    'equipe' => true,
                    'audit' => true,
                    'support_email' => true,
                    'permissions_avancees' => true,
                    'api_access' => true,
                    'support_prioritaire' => true,
                    'branding_personnalise' => true,
                ]),
                'price_monthly' => 100000,
                'price_yearly' => 1000000, // 100 000 * 10
                'currency' => 'FBU',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            // Vérifier si le plan existe déjà
            $existing = Plan::where('slug', $plan['slug'])->first();
            if ($existing) {
                $existing->update($plan);
                $this->command->info("Plan '{$plan['name']}' mis à jour.");
            } else {
                Plan::create($plan);
                $this->command->info("Plan '{$plan['name']}' créé.");
            }
        }

        $this->command->info('Tous les plans ont été configurés avec succès !');
    }
}