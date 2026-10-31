<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('access_logs', function (Blueprint $table) {
            $table->foreignId('team_id')
                ->nullable()
                ->after('client_id')
                ->constrained('teams')
                ->nullOnDelete();

            $table->index(['team_id', 'created_at']);
        });

        // Renseigner l'équipe des journaux existants à partir de leur projet…
        // Les anciens partages ne stockaient pas project_id : la ressource
        // journalisée (App\Models\Project) permet de le retrouver.
        DB::statement(
            "UPDATE access_logs
             SET project_id = resource_id
             WHERE project_id IS NULL
               AND resource_type = 'App\\\\Models\\\\Project'
               AND resource_id IS NOT NULL"
        );

        DB::statement(
            'UPDATE access_logs
             SET team_id = (SELECT projects.team_id FROM projects WHERE projects.id = access_logs.project_id)
             WHERE team_id IS NULL AND project_id IS NOT NULL'
        );

        // …ou de la ressource journalisée lorsque celle-ci est un projet
        // (anciens partages enregistrés sans project_id).
        DB::statement(
            "UPDATE access_logs
             SET team_id = (SELECT projects.team_id FROM projects WHERE projects.id = access_logs.resource_id)
             WHERE team_id IS NULL
               AND resource_type = 'App\\\\Models\\\\Project'
               AND resource_id IS NOT NULL"
        );

        // …puis de leur client (créations / modifications / suppressions de clients)…
        DB::statement(
            'UPDATE access_logs
             SET team_id = (SELECT clients.team_id FROM clients WHERE clients.id = access_logs.client_id)
             WHERE team_id IS NULL AND client_id IS NOT NULL'
        );

        // …et enfin des partages (resource_type = ProjectAccess) créés avant le suivi de l'équipe.
        DB::statement(
            "UPDATE access_logs
             SET team_id = (
                 SELECT projects.team_id
                 FROM project_accesses
                 INNER JOIN projects ON projects.id = project_accesses.project_id
                 WHERE project_accesses.id = access_logs.resource_id
             )
             WHERE team_id IS NULL
               AND resource_type LIKE '%ProjectAccess%'
               AND resource_id IS NOT NULL"
        );
    }

    public function down(): void
    {
        Schema::table('access_logs', function (Blueprint $table) {
            $table->dropForeign(['team_id']);
        });

        Schema::table('access_logs', function (Blueprint $table) {
            $table->dropIndex(['team_id', 'created_at']);
            $table->dropColumn('team_id');
        });
    }
};
