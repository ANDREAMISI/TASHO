<?php

namespace Tests\Feature;

use App\Models\File;
use App\Models\Project;
use App\Models\ProjectAccess;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
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

  public function test_expired_gallery_renders_expired_page_without_counting_a_view(): void
  {
    [, , , $access] = $this->makeGallery([
      'expires_at' => now()->subDay(),
    ]);

    $response = $this->get('/gallery/' . $access->access_token);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Gallery/Expired'));
    $this->assertSame(0, $access->fresh()->view_count);
  }

  public function test_gallery_at_view_limit_renders_limit_page_without_counting_a_view(): void
  {
    [, , , $access] = $this->makeGallery([
      'max_views' => 3,
      'view_count' => 3,
    ]);

    $response = $this->get('/gallery/' . $access->access_token);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Gallery/LimitReached'));
    $this->assertSame(3, $access->fresh()->view_count);
  }

  public function test_password_protected_gallery_shows_authentication_without_counting_a_view(): void
  {
    [, , , $access] = $this->makeGallery([
      'is_public' => false,
      'password' => 'secret-password',
    ]);

    $response = $this->get('/gallery/' . $access->access_token);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
      ->component('Gallery/Authenticate')
      ->where('access.id', $access->id));
    $response->assertDontSee('secret-password');
    $this->assertSame(0, $access->fresh()->view_count);
  }

  public function test_password_protected_gallery_rejects_wrong_password(): void
  {
    [, , , $access] = $this->makeGallery([
      'is_public' => false,
      'password' => 'secret-password',
    ]);

    $response = $this->from('/gallery/' . $access->access_token)
      ->post('/gallery/' . $access->access_token . '/authenticate', [
        'password' => 'wrong-password',
      ]);

    $response->assertSessionHasErrors('password');
    $response->assertRedirect('/gallery/' . $access->access_token);
    $this->assertSame(0, $access->fresh()->view_count);
  }

  public function test_password_protected_gallery_opens_after_correct_password(): void
  {
    [, , , $access] = $this->makeGallery([
      'is_public' => false,
      'password' => 'secret-password',
    ]);

    $response = $this->post('/gallery/' . $access->access_token . '/authenticate', [
      'name' => 'Client Test',
      'email' => 'client@example.com',
      'password' => 'secret-password',
    ]);

    $response->assertRedirect('/gallery/' . $access->access_token);
    $response->assertSessionHas('gallery_authenticated_' . $access->id, true);

    $this->get('/gallery/' . $access->access_token)
      ->assertOk()
      ->assertInertia(fn ($page) => $page->component('Gallery/Show'));

    $this->assertSame(1, $access->fresh()->view_count);
  }

  public function test_commenting_requires_passing_the_gallery_password(): void
  {
    [, , , $access] = $this->makeGallery([
      'is_public' => false,
      'password' => 'secret-password',
    ]);

    $response = $this->post('/gallery/' . $access->access_token . '/comment', [
      'name' => 'Intrus',
      'content' => 'Bonjour',
    ]);

    $response->assertStatus(403);
    $this->assertDatabaseCount('comments', 0);
  }

  public function test_comment_cannot_reference_a_file_from_another_project(): void
  {
    [, , $project, $access] = $this->makeGallery();

    [, , $otherProject] = $this->makeGallery();
    $foreignFile = File::create([
      'project_id' => $otherProject->id,
      'user_id' => $otherProject->owner_id,
      'name' => 'foreign',
      'original_name' => 'foreign.jpg',
      'slug' => 'foreign-file',
      'path' => 'projects/foreign/foreign.jpg',
      'disk' => 'local',
      'size' => 1024,
      'mime_type' => 'image/jpeg',
      'extension' => 'jpg',
    ]);

    $response = $this->postJson('/gallery/' . $access->access_token . '/comment', [
      'name' => 'Client',
      'content' => 'Bonjour',
      'file_id' => $foreignFile->id,
    ]);

    $response->assertStatus(422);
    $this->assertDatabaseCount('comments', 0);
  }

  public function test_creating_a_private_share_requires_a_password(): void
  {
    [$user, , $project] = $this->makeGallery();

    $response = $this->actingAs($user)->post(route('shares.share', $project), [
      'is_public' => false,
      'can_download' => true,
      'can_comment' => true,
      'can_favorite' => true,
      'expires_in_days' => 30,
    ]);

    $response->assertSessionHasErrors('password');
    $this->assertDatabaseCount('project_accesses', 1);
  }

  public function test_a_password_always_makes_the_share_private(): void
  {
    [$user, , $project] = $this->makeGallery();

    $response = $this->actingAs($user)->post(route('shares.share', $project), [
      'is_public' => true,
      'can_download' => true,
      'can_comment' => true,
      'can_favorite' => true,
      'expires_in_days' => 30,
      'password' => 'secret-password',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('project_accesses', [
      'project_id' => $project->id,
      'is_public' => 0,
      'password' => 'secret-password',
    ]);
  }

  public function test_thumbnail_requests_do_not_increment_file_views(): void
  {
    Storage::fake('local');

    [, , $project, $access] = $this->makeGallery();

    $file = File::create([
      'project_id' => $project->id,
      'user_id' => $project->owner_id,
      'name' => 'thumbnail',
      'original_name' => 'thumbnail.jpg',
      'slug' => 'thumbnail-file',
      'path' => 'projects/thumbnail/thumbnail.jpg',
      'disk' => 'local',
      'size' => 1024,
      'mime_type' => 'image/jpeg',
      'extension' => 'jpg',
    ]);

    Storage::disk('local')->put($file->path, 'image-bytes');

    $this->get('/gallery/' . $access->access_token . '/view/' . $file->id . '?thumb=1')
      ->assertOk();
    $this->assertSame(0, $file->fresh()->view_count);

    $this->get('/gallery/' . $access->access_token . '/view/' . $file->id)
      ->assertOk();
    $this->assertSame(1, $file->fresh()->view_count);
  }

  public function test_visitor_can_favorite_and_unfavorite_a_gallery_file(): void
  {
    [, , $project, $access] = $this->makeGallery();

    $file = File::create([
      'project_id' => $project->id,
      'user_id' => $project->owner_id,
      'name' => 'favorite',
      'original_name' => 'favorite.jpg',
      'slug' => 'favorite-file',
      'path' => 'projects/favorite/favorite.jpg',
      'disk' => 'local',
      'size' => 1024,
      'mime_type' => 'image/jpeg',
      'extension' => 'jpg',
    ]);

    $payload = [
      'file_id' => $file->id,
      'name' => 'Client Test',
      'email' => 'client@example.com',
    ];

    $this->postJson('/gallery/' . $access->access_token . '/favorite', $payload)
      ->assertOk()
      ->assertJson(['favorited' => true]);

    $this->assertDatabaseHas('favorites', [
      'file_id' => $file->id,
      'visitor_email' => 'client@example.com',
      'user_id' => null,
    ]);

    $this->postJson('/gallery/' . $access->access_token . '/favorite', $payload)
      ->assertOk()
      ->assertJson(['favorited' => false]);

    $this->assertDatabaseCount('favorites', 0);
  }

  /**
   * Crée un utilisateur, une équipe, un projet et un accès de galerie.
   *
   * @return array{0: User, 1: Team, 2: Project, 3: ProjectAccess}
   */
  private function makeGallery(array $accessAttributes = []): array
  {
    $user = User::factory()->create();

    $team = Team::create([
      'name' => 'Gallery Team ' . $user->id,
      'owner_id' => $user->id,
      'slug' => 'gallery-team-' . $user->id,
    ]);

    $project = Project::create([
      'team_id' => $team->id,
      'owner_id' => $user->id,
      'title' => 'Gallery project ' . $user->id,
      'slug' => 'gallery-project-' . $user->id,
      'status' => 'active',
    ]);

    $access = ProjectAccess::create(array_merge([
      'project_id' => $project->id,
      'access_token' => 'gallery-token-' . $user->id,
      'is_public' => true,
      'can_download' => true,
      'can_comment' => true,
      'can_favorite' => true,
    ], $accessAttributes));

    return [$user, $team, $project, $access];
  }
}
