<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_accesses', function (Blueprint $table) {
            // Permet de n'envoyer qu'une seule notification de téléchargement
            // par lien de partage.
            $table->timestamp('first_downloaded_at')
                ->nullable()
                ->after('last_accessed_at');
        });
    }

    public function down(): void
    {
        Schema::table('project_accesses', function (Blueprint $table) {
            $table->dropColumn('first_downloaded_at');
        });
    }
};
