<?php

namespace Tests\Feature;

use App\Models\File;
use App\Models\Project;
use App\Models\ProjectAccess;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicGalleryAccessTest extends TestCase
{
  use RefreshDatabase;

  public function test_public_gallery_route_is_accessible_for_valid_share(): void
  {
    $user = User::factory()->create();
    $team = Team::create([
      'name' => 'Studio Team',
      'owner_id' => $user->id,
      'slug' => 'studio-team',
    ]);

    $project = Project::create([
      'team_id' => $team->id,
      'owner_id' => $user->id,
      'title' => 'Portfolio project',
      'slug' => 'portfolio-project',
      'status' => 'active',
    ]);

    $file = File::create([
      'project_id' => $project->id,
      'user_id' => $user->id,
      'name' => 'preview',
      'original_name' => 'preview.jpg',
      'slug' => 'preview',
      'path' => 'projects/1/preview.jpg',
      'disk' => 'local',
      'size' => 1024,
      'mime_type' => 'image/jpeg',
      'extension' => 'jpg',
    ]);

    $access = ProjectAccess::create([
      'project_id' => $project->id,
      'access_token' => 'gallery-test-token-123',
      'is_public' => true,
      'can_download' => true,
      'can_comment' => true,
      'can_favorite' => true,
    ]);

    $response = $this->get('/gallery/' . $access->access_token);

    $response->assertStatus(200);
  }

  public function test_public_gallery_blocks_download_when_disabled(): void
  {
    $user = User::factory()->create();
    $team = Team::create([
      'name' => 'Studio Team 2',
      'owner_id' => $user->id,
      'slug' => 'studio-team-2',
    ]);

    $project = Project::create([
      'team_id' => $team->id,
      'owner_id' => $user->id,
      'title' => 'Blocked project',
      'slug' => 'blocked-project',
      'status' => 'active',
    ]);

    $file = File::create([
      'project_id' => $project->id,
      'user_id' => $user->id,
      'name' => 'blocked',
      'original_name' => 'blocked.jpg',
      'slug' => 'blocked',
      'path' => 'projects/1/blocked.jpg',
      'disk' => 'local',
      'size' => 1024,
      'mime_type' => 'image/jpeg',
      'extension' => 'jpg',
    ]);

    $access = ProjectAccess::create([
      'project_id' => $project->id,
      'access_token' => 'gallery-blocked-token-456',
      'is_public' => true,
      'can_download' => false,
      'can_comment' => true,
      'can_favorite' => true,
    ]);

    $response = $this->get('/gallery/' . $access->access_token . '/download/' . $file->id);

    $response->assertStatus(403);
  }
}
