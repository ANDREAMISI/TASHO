<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TeamController as AdminTeamController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Routes Publiques - Pages Marketing
|--------------------------------------------------------------------------
*/
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/features', [PageController::class, 'features'])->name('features');
Route::get('/pricing', [PageController::class, 'pricing'])->name('pricing');

/*
|--------------------------------------------------------------------------
| Routes d'Authentification (Breeze)
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Routes d'Invitation (Publiques)
|--------------------------------------------------------------------------
*/
Route::get('/invitation/{token}', [InvitationController::class, 'show'])->name('invitation.show');
Route::post('/invitation/{token}/accept', [InvitationController::class, 'accept'])->name('invitation.accept');
Route::post('/invitation/{token}/decline', [InvitationController::class, 'decline'])->name('invitation.decline');

/*
|--------------------------------------------------------------------------
| Routes Galerie Publique (Sans authentification)
|--------------------------------------------------------------------------
*/
Route::get('/gallery/{token}', [ShareController::class, 'publicGallery'])->name('public.gallery');
Route::post('/gallery/{token}/authenticate', [ShareController::class, 'authenticateGallery'])->name('public.authenticate');
Route::post('/gallery/{token}/comment', [ShareController::class, 'comment'])->name('public.comment');
Route::post('/gallery/{token}/favorite', [ShareController::class, 'favoriteGallery'])->name('public.favorite');
Route::get('/gallery/{token}/view/{file}', [ShareController::class, 'viewFile'])->name('public.view');
Route::get('/gallery/{token}/download/{file}', [ShareController::class, 'downloadFile'])->name('public.download');
Route::get('/gallery/{token}/comments', [ShareController::class, 'getComments'])->name('public.comments');

/*
|--------------------------------------------------------------------------
| Routes Protégées (Authentification requise)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Invitations - Acceptation après inscription
    Route::post('/invitation/accept-after-registration', [InvitationController::class, 'acceptAfterRegistration'])
        ->name('invitation.accept-after-registration');
    
    // Invitations - Génération de lien (API)
    Route::post('/invitation/generate-link', [InvitationController::class, 'generateLink'])
        ->name('invitation.generate-link');
    
    // ============================================================
    // Routes Équipe
    // ============================================================
    Route::prefix('team')->name('team.')->group(function () {
        Route::get('/', [TeamController::class, 'index'])->name('index');
        Route::get('/create', [TeamController::class, 'create'])->name('create');
        Route::post('/', [TeamController::class, 'store'])->name('store');
        Route::get('/{team}', [TeamController::class, 'show'])->name('show');
        Route::put('/{team}', [TeamController::class, 'update'])->name('update');
        Route::delete('/{team}', [TeamController::class, 'destroy'])->name('destroy');
        
        // Invitations
        Route::post('/{team}/invitations', [TeamController::class, 'invite'])->name('invite');
        Route::delete('/invitations/{invitation}', [TeamController::class, 'cancelInvitation'])->name('cancel-invitation');
        Route::get('/invitations/{token}', [TeamController::class, 'acceptInvitation'])->name('accept-invitation');
        
        // Membres
        Route::delete('/{team}/members/{user}', [TeamController::class, 'removeMember'])->name('remove-member');
        Route::put('/{team}/members/{user}/role', [TeamController::class, 'updateRole'])->name('update-role');
    });
    
    // ============================================================
    // Routes Projets
    // ============================================================
    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::get('/create', [ProjectController::class, 'create'])->name('create');
        Route::post('/', [ProjectController::class, 'store'])->name('store');
        Route::get('/{project}', [ProjectController::class, 'show'])->name('show');
        Route::put('/{project}', [ProjectController::class, 'update'])->name('update');
        Route::delete('/{project}', [ProjectController::class, 'destroy'])->name('destroy');
        
        // Dossiers
        Route::post('/{project}/folders', [ProjectController::class, 'createFolder'])->name('create-folder');
        Route::put('/folders/{folder}', [ProjectController::class, 'renameFolder'])->name('rename-folder');
        Route::delete('/folders/{folder}', [ProjectController::class, 'deleteFolder'])->name('delete-folder');
        
        // Membres du projet
        Route::post('/{project}/members', [ProjectController::class, 'addMember'])->name('add-member');
        Route::delete('/{project}/members/{user}', [ProjectController::class, 'removeMember'])->name('remove-member');
        Route::put('/{project}/members/{user}/role', [ProjectController::class, 'updateMemberRole'])->name('update-member-role');
    });
    
    // ============================================================
    // Routes Fichiers
    // ============================================================
    Route::prefix('files')->name('files.')->group(function () {
        Route::get('/', function () {
            $user = auth()->user();
            $team = $user->teams()->first();

            if (!$team) {
                return redirect()->route('team.create');
            }

            $project = $team->projects()->latest()->first();

            if (!$project) {
                return redirect()->route('projects.create');
            }

            return redirect()->route('files.index', $project);
        })->name('home');

        Route::get('/{project}', [FileController::class, 'index'])->name('index');
        Route::post('/upload', [FileController::class, 'upload'])->name('upload');
        Route::get('/{file}/download', [FileController::class, 'download'])->name('download');
        Route::get('/{file}/preview', [FileController::class, 'preview'])->name('preview');
        Route::delete('/{file}', [FileController::class, 'destroy'])->name('destroy');
        Route::post('/{file}/favorite', [FileController::class, 'favorite'])->name('favorite');
        Route::put('/{file}', [FileController::class, 'update'])->name('update');
    });
    
    // ============================================================
    // Routes Clients
    // ============================================================
    Route::prefix('clients')->name('clients.')->group(function () {
        Route::get('/', [ClientController::class, 'index'])->name('index');
        Route::post('/', [ClientController::class, 'store'])->name('store');
        Route::put('/{client}', [ClientController::class, 'update'])->name('update');
        Route::delete('/{client}', [ClientController::class, 'destroy'])->name('destroy');
    });
    
    // ============================================================
    // Routes Partages
    // ============================================================
    Route::prefix('shares')->name('shares.')->group(function () {
        Route::get('/', [ShareController::class, 'index'])->name('index');
        Route::post('/{project}', [ShareController::class, 'share'])->name('share');
        Route::put('/{access}', [ShareController::class, 'update'])->name('update');
        Route::delete('/{access}', [ShareController::class, 'revoke'])->name('revoke');
    });
    
    // ============================================================
    // Routes Activité
    // ============================================================
    Route::prefix('activity')->name('activity.')->group(function () {
        Route::get('/', [ActivityController::class, 'index'])->name('index');
        Route::get('/export', [ActivityController::class, 'export'])->name('export');
        Route::get('/{project}', [ActivityController::class, 'project'])->name('project');
    });
    
    // ============================================================
    // Routes Paramètres (à venir)
    // ============================================================
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::put('/team', [SettingsController::class, 'updateTeam'])->name('update-team');
        Route::put('/profile', [SettingsController::class, 'updateProfile'])->name('update-profile');
        Route::get('/subscription', [SettingsController::class, 'subscription'])->name('subscription');
    });
});

/*
|--------------------------------------------------------------------------
| Routes Admin (Super Admin uniquement)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'super.admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard Admin
    Route::get('/dashboard', [DashboardController::class, 'admin'])->name('dashboard');
    
    // ============================================================
    // Gestion des utilisateurs
    // ============================================================
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/toggle', [UserController::class, 'toggle'])->name('users.toggle');
    
    // ============================================================
    // Gestion des équipes (Admin)
    // ============================================================
    Route::get('/teams', [AdminTeamController::class, 'index'])->name('teams.index');
    Route::get('/teams/{team}', [AdminTeamController::class, 'show'])->name('teams.show');
    Route::delete('/teams/{team}', [AdminTeamController::class, 'destroy'])->name('teams.destroy');
    
    // ============================================================
    // Gestion des abonnements
    // ============================================================
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::get('/subscriptions/create', [SubscriptionController::class, 'create'])->name('subscriptions.create');
    Route::post('/subscriptions', [SubscriptionController::class, 'store'])->name('subscriptions.store');
    Route::get('/subscriptions/{subscription}', [SubscriptionController::class, 'show'])->name('subscriptions.show');
    Route::get('/subscriptions/{subscription}/edit', [SubscriptionController::class, 'edit'])->name('subscriptions.edit');
    Route::put('/subscriptions/{subscription}', [SubscriptionController::class, 'update'])->name('subscriptions.update');
    Route::delete('/subscriptions/{subscription}', [SubscriptionController::class, 'destroy'])->name('subscriptions.destroy');
    Route::post('/subscriptions/{subscription}/toggle', [SubscriptionController::class, 'toggle'])->name('subscriptions.toggle');
});

/*
|--------------------------------------------------------------------------
| Routes API (Authentification Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->prefix('api')->name('api.')->group(function () {
    // Statistiques
    Route::get('/stats/project/{project}', [ApiController::class, 'projectStats'])->name('stats.project');
    Route::get('/stats/team', [ApiController::class, 'teamStats'])->name('stats.team');
    
    // Recherche
    Route::get('/search', [SearchController::class, 'search'])->name('search');
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});