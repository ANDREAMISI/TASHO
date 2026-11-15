<?php

namespace Tests\Feature;

use App\Models\File;
use App\Models\Folder;
use App\Models\Project;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeamProjectAccessTest extends TestCase
{
    use RefreshDatabase;

    private function makeTeam(User $owner): Team
    {
        $team = Team::create([
            'name' => 'Studio de test',
            'owner_id' => $owner->id,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return $team;
    }

    private function addMember(Team $team, User $user, string $role): void
    {
        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'role' => $role,
            'joined_at' => now(),
        ]);
    }

    private function makeProject(Team $team, User $owner, string $title = 'Projet partagé'): Project
    {
        return Project::create([
            'team_id' => $team->id,
            'owner_id' => $owner->id,
            'title' => $title,
            'status' => 'active',
            'priority' => 'medium',
        ]);
    }

    private function makeFile(Project $project, User $owner): File
    {
        return File::create([
            'project_id' => $project->id,
            'user_id' => $owner->id,
            'name' => 'document',
            'original_name' => 'document.pdf',
            'path' => 'projects/'.$project->id.'/document.pdf',
            'disk' => 'local',
            'size' => 7,
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'uploaded_at' => now(),
        ]);
    }

    public function test_viewer_can_read_team_projects_and_files_but_cannot_change_them(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $otherOwner = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $viewer, 'viewer');
        $project = $this->makeProject($team, $owner);
        $otherTeam = $this->makeTeam($otherOwner);
        $otherProject = $this->makeProject($otherTeam, $otherOwner, 'Projet privé');
        $project->members()->attach($viewer, [
            'role' => 'editor',
            'assigned_at' => now(),
        ]);
        $folder = Folder::create([
            'project_id' => $project->id,
            'created_by' => $owner->id,
            'name' => 'Photos',
            'path' => '/photos',
        ]);
        $file = $this->makeFile($project, $owner);
        $file->update(['folder_id' => $folder->id]);
        Storage::disk('local')->put($file->path, 'contenu');

        $this->actingAs($viewer)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Index')
                ->where('stats.projects.total', 1)
                ->where('canCreateProjects', false)
            );

        $this->actingAs($viewer)
            ->get(route('projects.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Project/Index')
                ->has('projects.data', 1)
                ->where('canCreateProjects', false)
            );

        $this->actingAs($viewer)
            ->get(route('projects.show', [
                'project' => $project,
                'tab' => 'files',
                'folder_id' => $folder->id,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Project/Show')
                ->where('canManage', false)
                ->where('canUpload', false)
                ->where('canDeleteFolders', false)
                ->where('currentFolder.name', 'Photos')
                ->has('files.data', 1)
            );

        $this->actingAs($viewer)
            ->get(route('files.preview', $file))
            ->assertOk()
            ->assertJsonPath('id', $file->id);

        $this->actingAs($viewer)
            ->get(route('projects.show', $otherProject))
            ->assertForbidden();

        $this->actingAs($viewer)
            ->get(route('files.download', $file))
            ->assertOk();

        $this->actingAs($viewer)
            ->put(route('projects.update', $project), [
                'title' => 'Projet modifié',
                'status' => 'active',
                'priority' => 'medium',
            ])
            ->assertForbidden();

        $this->actingAs($viewer)
            ->post(route('projects.create-folder', $project), ['name' => 'Nouveau dossier'])
            ->assertForbidden();

        $this->actingAs($viewer)
            ->post(route('files.upload'), [
                'project_id' => $project->id,
                'file' => UploadedFile::fake()->createWithContent('nouveau.txt', 'contenu'),
            ])
            ->assertForbidden();

        $this->actingAs($viewer)
            ->delete(route('files.destroy', $file))
            ->assertForbidden();

        $this->actingAs($viewer)
            ->post(route('projects.store'), [
                'title' => 'Projet interdit',
                'status' => 'active',
                'priority' => 'medium',
            ])
            ->assertForbidden();
    }

    public function test_manager_can_modify_and_add_team_project_content_but_cannot_delete_others_content(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $team = $this->makeTeam($owner);
        $this->addMember($team, $manager, 'manager');
        $project = $this->makeProject($team, $owner);
        $folder = Folder::create([
            'project_id' => $project->id,
            'created_by' => $owner->id,
            'name' => 'Photos',
            'path' => '/photos',
        ]);
        $file = $this->makeFile($project, $owner);

        $this->actingAs($manager)
            ->get(route('projects.show', ['project' => $project, 'tab' => 'files']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Project/Show')
                ->where('canManage', true)
                ->where('canUpload', true)
                ->where('canDeleteFolders', false)
                ->where('canManageShares', false)
            );

        $this->actingAs($manager)
            ->put(route('projects.update', $project), [
                'title' => 'Projet modifié',
                'status' => 'active',
                'priority' => 'medium',
            ])
            ->assertRedirect();
        $this->assertSame('Projet modifié', $project->fresh()->title);

        $this->actingAs($manager)
            ->post(route('projects.create-folder', $project), ['name' => 'Nouveau dossier'])
            ->assertRedirect();
        $this->assertDatabaseHas('folders', [
            'project_id' => $project->id,
            'name' => 'Nouveau dossier',
        ]);

        $this->actingAs($manager)
            ->put(route('files.update', $file), ['name' => 'document-renomme.pdf'])
            ->assertRedirect();
        $this->assertSame('document-renomme.pdf', $file->fresh()->original_name);

        $this->actingAs($manager)
            ->post(route('files.upload'), [
                'project_id' => $project->id,
                'folder_id' => $folder->id,
                'file' => UploadedFile::fake()->createWithContent('ajout.txt', 'contenu'),
            ])
            ->assertRedirect();
        $this->assertDatabaseHas('files', [
            'project_id' => $project->id,
            'user_id' => $manager->id,
            'original_name' => 'ajout.txt',
        ]);

        $this->actingAs($manager)
            ->post(route('projects.store'), [
                'title' => 'Nouveau projet',
                'status' => 'active',
                'priority' => 'medium',
            ])
            ->assertRedirect();
        $this->assertDatabaseHas('projects', [
            'team_id' => $team->id,
            'owner_id' => $manager->id,
            'title' => 'Nouveau projet',
        ]);

        $this->actingAs($manager)
            ->delete(route('projects.delete-folder', $folder))
            ->assertForbidden();

        $this->actingAs($manager)
            ->delete(route('files.destroy', $file))
            ->assertForbidden();

        $this->actingAs($manager)
            ->delete(route('projects.destroy', $project))
            ->assertForbidden();
    }
}
