<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->bigInteger('storage_limit')->default(0);
            $table->integer('max_team_members')->default(1);
            $table->integer('max_projects')->default(-1);
            $table->bigInteger('max_file_size')->default(52428800);
            $table->json('features')->nullable();
            // ✅ Prix en Franc Burundais (FBU)
            $table->decimal('price_monthly', 15, 0)->default(0); // FBU (pas de décimales)
            $table->decimal('price_yearly', 15, 0)->default(0);  // FBU
            $table->string('currency')->default('FBU');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index('slug');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};