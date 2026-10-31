<?php

namespace App\Services;

use App\Models\File;
use App\Models\Project;
use App\Models\ProjectAccess;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;

/**
 * Centralise la création et la présentation des notifications in-app.
 *
 * Toutes les notifications sont stockées dans la table `notifications`
 * (canal `database` de Laravel) ; le payload contient le type métier,
 * le titre, le message et l'URL à ouvrir.
 */
class NotificationService
{
    /**
     * Types de notifications exposés dans les filtres.
     *
     * @var array<string, string>
     */
    public const TYPES = [
        'comment' => 'Commentaires',
        'favorite' => 'Favoris',
        'share_view' => 'Consultations',
        'share_download' => 'Téléchargements',
        'upload' => 'Fichiers',
        'team' => 'Équipe',
        'project' => 'Projets',
        'subscription' => 'Abonnement',
        'storage' => 'Stockage',
    ];

    /**
     * Libellés français des rôles.
     *
     * @var array<string, string>
     */
    public const ROLE_LABELS = [
        'owner' => 'Propriétaire',
        'manager' => 'Gestionnaire',
        'editor' => 'Éditeur',
        'viewer' => 'Lecteur',
    ];

    // ============================================================
    // ENVOI
    // ============================================================

    /**
     * Envoyer une notification à une liste d'utilisateurs.
     *
     * @param  iterable<User>  $users
     * @param  array<string, mixed>  $payload
     */
    public function notifyUsers(iterable $users, array $payload, ?User $except = null): void
    {
        $recipients = collect($users)
            ->filter(fn ($user) => $user instanceof User)
            ->reject(fn (User $user) => $user->is_active === false)
            ->unique('id')
            ->reject(fn (User $user) => $except && $user->id === $except->id)
            ->values();

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send($recipients, new AppNotification($payload));
    }

    /**
     * Propriétaire et membres d'un projet.
     *
     * @return Collection<int, User>
     */
    public function projectAudience(Project $project): Collection
    {
        return collect([$project->owner])
            ->filter()
            ->merge($project->members()->get())
            ->unique('id')
            ->values();
    }

    /**
     * Notifier toutes les parties prenantes d'un projet.
     *
     * @param  array<string, mixed>  $payload
     */
    public function notifyProject(Project $project, array $payload, ?User $except = null): void
    {
        $this->notifyUsers($this->projectAudience($project), $payload, $except);
    }

    /**
     * Notifier le propriétaire d'une équipe.
     *
     * @param  array<string, mixed>  $payload
     */
    public function notifyTeamOwner(Team $team, array $payload, ?User $except = null): void
    {
        if ($team->owner) {
            $this->notifyUsers([$team->owner], $payload, $except);
        }
    }

    // ============================================================
    // ÉVÉNEMENTS
    // ============================================================

    public function commentReceived(
        Project $project,
        string $actorName,
        ?string $actorEmail = null,
        ?File $file = null,
        ?int $accessId = null
    ): void {
        $target = $file ? '« ' . $this->fileName($file) . ' »' : '« ' . $project->title . ' »';

        $this->notifyProject($project, $this->payload(
            'comment',
            'Nouveau commentaire',
            $actorName . ' a commenté ' . $target . '.',
            route('projects.show', ['project' => $project->id, 'tab' => 'activity'], false),
            ['name' => $actorName, 'email' => $actorEmail],
            ['label' => $project->title, 'type' => 'project'],
            ['access_id' => $accessId, 'file_id' => $file?->id],
        ));
    }

    public function favoriteReceived(
        Project $project,
        string $actorName,
        ?string $actorEmail,
        File $file,
        ?int $accessId = null
    ): void {
        $this->notifyProject($project, $this->payload(
            'favorite',
            'Nouveau favori',
            $actorName . ' a ajouté « ' . $this->fileName($file) . ' » à ses favoris.',
            route('projects.show', ['project' => $project->id, 'tab' => 'files'], false),
            ['name' => $actorName, 'email' => $actorEmail],
            ['label' => $project->title, 'type' => 'project'],
            ['access_id' => $accessId, 'file_id' => $file->id],
        ));
    }

    public function shareViewed(ProjectAccess $access): void
    {
        $project = $access->project;

        if (! $project || ! $project->owner) {
            return;
        }

        $who = $access->client?->name ?: 'Un visiteur';

        $this->notifyUsers([$project->owner], $this->payload(
            'share_view',
            'Partage consulté',
            $who . ' a ouvert le lien de partage de « ' . $project->title . ' ».',
            route('projects.show', ['project' => $project->id, 'tab' => 'shares'], false),
            null,
            ['label' => $project->title, 'type' => 'project'],
            ['access_id' => $access->id],
        ));
    }

    public function shareDownloaded(ProjectAccess $access, File $file): void
    {
        $project = $access->project;

        if (! $project || ! $project->owner) {
            return;
        }

        $who = $access->client?->name ?: 'Un visiteur';

        $this->notifyUsers([$project->owner], $this->payload(
            'share_download',
            'Fichier téléchargé',
            $who . ' a téléchargé « ' . $this->fileName($file) . ' » depuis le partage de « ' . $project->title . ' ».',
            route('projects.show', ['project' => $project->id, 'tab' => 'files'], false),
            null,
            ['label' => $project->title, 'type' => 'project'],
            ['access_id' => $access->id, 'file_id' => $file->id],
        ));
    }

    public function fileUploaded(File $file): void
    {
        $project = $file->project;

        if (! $project) {
            return;
        }

        $uploader = $file->user;
        $actorName = $uploader?->name ?? 'Un membre';

        $this->notifyProject($project, $this->payload(
            'upload',
            'Nouveau fichier',
            $actorName . ' a ajouté « ' . $this->fileName($file) . ' » à « ' . $project->title . ' ».',
            route('projects.show', ['project' => $project->id, 'tab' => 'files'], false),
            ['name' => $actorName, 'avatar' => $uploader?->avatar_url],
            ['label' => $project->title, 'type' => 'project'],
            ['file_id' => $file->id],
        ), $uploader);
    }

    public function teamInvitationAccepted(TeamInvitation $invitation, User $member): void
    {
        $team = $invitation->team;

        if (! $team) {
            return;
        }

        $recipients = collect([$invitation->invitedBy, $team->owner])
            ->filter()
            ->unique('id');

        $this->notifyUsers($recipients, $this->payload(
            'team',
            'Invitation acceptée',
            $member->name . ' a rejoint l’équipe « ' . $team->name . ' ».',
            route('team.show', $team->id, false),
            ['name' => $member->name, 'avatar' => $member->avatar_url],
            ['label' => $team->name, 'type' => 'team'],
        ), $member);
    }

    public function teamMemberRemoved(Team $team, User $member, ?User $actor = null): void
    {
        $message = $actor
            ? $actor->name . ' vous a retiré de l’équipe « ' . $team->name . ' ».'
            : 'Vous avez été retiré de l’équipe « ' . $team->name . ' ».';

        $this->notifyUsers([$member], $this->payload(
            'team',
            'Retrait de l’équipe',
            $message,
            route('dashboard', absolute: false),
            null,
            ['label' => $team->name, 'type' => 'team'],
        ), $actor);
    }

    public function teamRoleChanged(Team $team, User $member, string $role, ?User $actor = null): void
    {
        $label = self::ROLE_LABELS[$role] ?? ucfirst($role);

        $this->notifyUsers([$member], $this->payload(
            'team',
            'Rôle modifié',
            'Votre rôle dans l’équipe « ' . $team->name . ' » est désormais ' . $label . '.',
            route('team.show', $team->id, false),
            $actor ? ['name' => $actor->name, 'avatar' => $actor->avatar_url] : null,
            ['label' => $team->name, 'type' => 'team'],
        ), $actor);
    }

    public function projectMemberAdded(Project $project, User $member, ?User $actor = null, string $role = 'viewer'): void
    {
        $label = self::ROLE_LABELS[$role] ?? ucfirst($role);
        $message = $actor
            ? $actor->name . ' vous a ajouté au projet « ' . $project->title . ' » en tant que ' . $label . '.'
            : 'Vous avez été ajouté au projet « ' . $project->title . ' » en tant que ' . $label . '.';

        $this->notifyUsers([$member], $this->payload(
            'project',
            'Ajout à un projet',
            $message,
            route('projects.show', $project->id, false),
            $actor ? ['name' => $actor->name, 'avatar' => $actor->avatar_url] : null,
            ['label' => $project->title, 'type' => 'project'],
        ), $actor);
    }

    public function projectMemberRemoved(Project $project, User $member, ?User $actor = null): void
    {
        $message = $actor
            ? $actor->name . ' vous a retiré du projet « ' . $project->title . ' ».'
            : 'Vous avez été retiré du projet « ' . $project->title . ' ».';

        $this->notifyUsers([$member], $this->payload(
            'project',
            'Retrait d’un projet',
            $message,
            route('projects.index', absolute: false),
            null,
            ['label' => $project->title, 'type' => 'project'],
        ), $actor);
    }

    public function projectRoleChanged(Project $project, User $member, string $role, ?User $actor = null): void
    {
        $label = self::ROLE_LABELS[$role] ?? ucfirst($role);

        $this->notifyUsers([$member], $this->payload(
            'project',
            'Rôle modifié',
            'Votre rôle dans le projet « ' . $project->title . ' » est désormais ' . $label . '.',
            route('projects.show', $project->id, false),
            $actor ? ['name' => $actor->name, 'avatar' => $actor->avatar_url] : null,
            ['label' => $project->title, 'type' => 'project'],
        ), $actor);
    }

    // ============================================================
    // ALERTES COMPTE (abonnement, stockage)
    // ============================================================

    /**
     * Vérifier l'abonnement et le stockage d'une équipe, et créer au plus
     * une alerte par jour pour chaque seuil.
     */
    public function scanAccountAlerts(Team $team): void
    {
        if (! $team->owner) {
            return;
        }

        $billing = app(BillingSummaryService::class)->forTeam($team);

        $this->evaluateSubscription($team, $billing);
        $this->evaluateStorage($team, $billing['storage'] ?? null);
    }

    /**
     * @param  array<string, mixed>  $billing
     */
    private function evaluateSubscription(Team $team, array $billing): void
    {
        $subscription = $billing['subscription'] ?? null;

        if (! $subscription || empty($subscription['end_date'])) {
            return;
        }

        $end = Carbon::parse($subscription['end_date'])->startOfDay();
        $today = now()->startOfDay();
        $planName = $billing['plan']['name'] ?? 'votre abonnement';
        $key = 'notification:subscription:' . $team->id . ':' . $end->toDateString();

        if ($end->lt($today)) {
            $this->notifyOnce($key, [$team->owner], $this->payload(
                'subscription',
                'Abonnement expiré',
                'L’abonnement « ' . $planName . ' » de « ' . $team->name . ' » a expiré le ' . $end->format('d/m/Y') . '.',
                route('settings.subscription', absolute: false),
                null,
                ['label' => $team->name, 'type' => 'team'],
            ));

            return;
        }

        if ($end->lte($today->copy()->addDays(7))) {
            $days = (int) $today->diffInDays($end);
            $when = $days <= 1 ? 'demain' : 'dans ' . $days . ' jours';

            $this->notifyOnce($key, [$team->owner], $this->payload(
                'subscription',
                'Abonnement bientôt expiré',
                'L’abonnement « ' . $planName . ' » de « ' . $team->name . ' » expire ' . $when . ' (' . $end->format('d/m/Y') . ').',
                route('settings.subscription', absolute: false),
                null,
                ['label' => $team->name, 'type' => 'team'],
            ));
        }
    }

    /**
     * @param  array{used:int, limit:int, percentage:float}|null  $storage
     */
    private function evaluateStorage(Team $team, ?array $storage): void
    {
        if (! $storage || (int) $storage['limit'] <= 0) {
            return;
        }

        $this->notifyStorageAlert(
            $team,
            (int) $storage['used'],
            (int) $storage['limit'],
            (float) $storage['percentage'],
        );
    }

    /**
     * Créer l'alerte de stockage si le seuil de 90 % ou 100 % est franchi.
     *
     * Méthode publique pour permettre la vérification et les tests.
     */
    public function notifyStorageAlert(Team $team, int $used, int $limit, float $percentage): void
    {
        if (! $team->owner || $limit <= 0) {
            return;
        }

        if ($percentage >= 100) {
            $this->notifyOnce('notification:storage:full:' . $team->id, [$team->owner], $this->payload(
                'storage',
                'Stockage plein',
                'L’espace de stockage de « ' . $team->name . ' » est plein ('
                    . $this->formatBytes($used) . ' sur ' . $this->formatBytes($limit) . ').',
                route('settings.subscription', absolute: false),
                null,
                ['label' => $team->name, 'type' => 'team'],
            ));

            return;
        }

        if ($percentage >= 90) {
            $this->notifyOnce('notification:storage:high:' . $team->id, [$team->owner], $this->payload(
                'storage',
                'Stockage presque plein',
                'Vous avez utilisé ' . number_format($percentage, 1, ',', ' ') . ' % de votre espace de stockage ('
                    . $this->formatBytes($used) . ' sur ' . $this->formatBytes($limit) . ').',
                route('settings.subscription', absolute: false),
                null,
                ['label' => $team->name, 'type' => 'team'],
            ));
        }
    }

    /**
     * Alerte de stockage après un téléversement.
     */
    public function scanStorageForProject(Project $project): void
    {
        if (! $project->team) {
            return;
        }

        $billing = app(BillingSummaryService::class)->forTeam($project->team);

        $this->evaluateStorage($project->team, $billing['storage'] ?? null);
    }

    // ============================================================
    // LECTURE
    // ============================================================

    /**
     * Résumé pour la cloche de la barre supérieure.
     *
     * @return array{unread_count:int, recent:array<int, array<string, mixed>>}
     */
    public function summaryFor(User $user, int $limit = 5): array
    {
        return [
            'unread_count' => $user->unreadNotifications()->count(),
            'recent' => $user->notifications()
                ->limit($limit)
                ->get()
                ->map(fn (DatabaseNotification $notification) => $this->present($notification))
                ->all(),
        ];
    }

    /**
     * Sérialiser une notification pour le frontend.
     *
     * @return array<string, mixed>
     */
    public function present(DatabaseNotification $notification): array
    {
        $data = $notification->data ?? [];

        return [
            'id' => $notification->id,
            'type' => $data['type'] ?? 'info',
            'title' => $data['title'] ?? 'Notification',
            'message' => $data['message'] ?? '',
            'url' => $data['url'] ?? null,
            'actor' => $data['actor'] ?? null,
            'subject' => $data['subject'] ?? null,
            'meta' => $data['meta'] ?? null,
            'is_read' => $notification->read_at !== null,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }

    // ============================================================
    // UTILITAIRES
    // ============================================================

    /**
     * @param  array<string, mixed>  $payload
     */
    private function notifyOnce(string $key, iterable $users, array $payload): void
    {
        // `add` renvoie false si la clé existe déjà (24 h de silence).
        if (! Cache::add($key, true, now()->addDay())) {
            return;
        }

        $this->notifyUsers($users, $payload);
    }

    /**
     * @param  array<string, mixed>|null  $actor
     * @param  array<string, mixed>|null  $subject
     * @param  array<string, mixed>  $meta
     * @return array<string, mixed>
     */
    private function payload(
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        ?array $actor = null,
        ?array $subject = null,
        array $meta = []
    ): array {
        return array_filter(
            [
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'url' => $url,
                'actor' => $actor,
                'subject' => $subject,
                'meta' => $meta ?: null,
            ],
            fn ($value) => $value !== null,
        );
    }

    private function fileName(File $file): string
    {
        return $file->original_name ?: $file->name;
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['o', 'Ko', 'Mo', 'Go', 'To'];
        $value = max(0, $bytes);
        $exponent = $value > 0
            ? min((int) floor(log($value, 1024)), count($units) - 1)
            : 0;
        $size = $value / (1024 ** $exponent);

        return number_format($size, $exponent === 0 ? 0 : 1, ',', ' ') . ' ' . $units[$exponent];
    }
}
