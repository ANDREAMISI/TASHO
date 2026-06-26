<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['owner', 'manager', 'editor', 'viewer'])->default('viewer');
            $table->json('permissions')->nullable();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['project_id', 'user_id']);
            $table->index(['project_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};