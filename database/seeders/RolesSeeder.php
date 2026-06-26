<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Super Admin', 'slug' => 'super-admin', 'is_system' => true],
            ['name' => 'Owner', 'slug' => 'owner', 'is_system' => true],
            ['name' => 'Manager', 'slug' => 'manager', 'is_system' => true],
            ['name' => 'Editor', 'slug' => 'editor', 'is_system' => true],
            ['name' => 'Viewer', 'slug' => 'viewer', 'is_system' => true],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert($role);
        }
    }
}