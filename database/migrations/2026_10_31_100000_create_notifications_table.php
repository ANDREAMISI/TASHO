<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Le badge de la cloche ne lit que les notifications non lues
            // d'un utilisateur : cet index couvre la requête.
            $table->index(
                ['notifiable_type', 'notifiable_id', 'read_at'],
                'notifications_unread_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
