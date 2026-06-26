<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_accesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->nullable()->constrained()->onDelete('set null');
            $table->string('access_token')->unique();
            $table->string('password')->nullable();
            $table->boolean('is_public')->default(false);
            $table->boolean('can_download')->default(true);
            $table->boolean('can_comment')->default(true);
            $table->boolean('can_favorite')->default(true);
            $table->json('allowed_folders')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('max_views')->nullable();
            $table->integer('view_count')->default(0);
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
            
            $table->index('access_token');
            $table->index(['project_id', 'client_id']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_accesses');
    }
};