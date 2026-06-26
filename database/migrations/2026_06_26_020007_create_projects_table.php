<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->onDelete('cascade');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('client_name')->nullable();
            $table->string('client_email')->nullable();
            $table->enum('status', ['draft', 'active', 'archived', 'completed'])->default('draft');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            
            $table->index('slug');
            $table->index(['team_id', 'status']);
            $table->index(['owner_id', 'status']);
            $table->index('client_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};