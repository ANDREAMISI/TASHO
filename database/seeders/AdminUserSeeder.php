<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Vérifier si le Super Admin existe déjà
        $admin = User::where('email', 'admin@tasho.com')->first();

        if (!$admin) {
            $admin = User::create([
                'name' => 'Super Admin',
                'email' => 'admin@tasho.com',
                'password' => bcrypt('password123'),
                'profession' => 'Administrateur',
                'work_type' => 'alone',
                'storage_volume' => 'plus de 1TB',
                'email_verified_at' => now(),
                'is_active' => true,
            ]);

            $team = Team::create([
                'name' => 'TASHO Administration',
                'owner_id' => $admin->id,
                'description' => 'Équipe d\'administration de la plateforme TASHO',
                'is_active' => true,
            ]);

            TeamMember::create([
                'team_id' => $team->id,
                'user_id' => $admin->id,
                'role' => 'owner',
                'joined_at' => now(),
            ]);

            $this->command->info('Super Admin créé avec succès !');
        } else {
            $this->command->info('Le Super Admin existe déjà.');
        }
    }
}