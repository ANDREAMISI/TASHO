<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('file_id')->nullable()->constrained('files')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('visitor_name')->nullable();
            $table->string('visitor_email')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
            $table->text('content');
            $table->json('metadata')->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['project_id', 'file_id']);
            $table->index(['user_id', 'created_at']);
            $table->index('parent_id');
            $table->index('is_resolved');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};