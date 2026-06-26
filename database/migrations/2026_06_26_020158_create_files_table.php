<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('folder_id')->nullable()->constrained('folders')->onDelete('set null');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('original_name');
            $table->string('slug')->unique();
            $table->string('path');
            $table->string('disk')->default('local');
            $table->bigInteger('size')->default(0);
            $table->string('mime_type');
            $table->string('extension')->nullable();
            $table->string('hash')->nullable();
            $table->boolean('is_public')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamp('last_accessed_at')->nullable();
            $table->integer('download_count')->default(0);
            $table->integer('view_count')->default(0);
            $table->timestamps();
            
            $table->index('slug');
            $table->index(['project_id', 'folder_id']);
            $table->index(['user_id', 'project_id']);
            $table->index('mime_type');
            $table->index('size');
            $table->index('hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};