<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('country')->nullable()->after('phone');
            $table->string('profession')->nullable()->after('country');
            $table->enum('work_type', ['alone', 'team'])->default('alone')->after('profession');
            // ✅ Correction : utiliser string au lieu de enum pour éviter les problèmes
            $table->string('storage_volume')->nullable()->after('work_type');
            $table->string('avatar')->nullable()->after('storage_volume');
            $table->text('bio')->nullable()->after('avatar');
            $table->json('settings')->nullable()->after('bio');
            $table->boolean('is_active')->default(true)->after('settings');
            $table->timestamp('last_active_at')->nullable()->after('is_active');
            
            $table->index('profession');
            $table->index('work_type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'country',
                'profession',
                'work_type',
                'storage_volume',
                'avatar',
                'bio',
                'settings',
                'is_active',
                'last_active_at'
            ]);
        });
    }
};