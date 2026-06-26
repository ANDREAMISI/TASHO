<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Changer le type de la colonne de enum à string
            $table->string('storage_volume')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revenir à enum si nécessaire
            $table->enum('storage_volume', [
                'moins de 10GB',
                '10GB à 100GB',
                '100GB à 1TB',
                'plus de 1TB'
            ])->nullable()->change();
        });
    }
};