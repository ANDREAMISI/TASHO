<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
    }

    /**
     * Centre de notifications de l'espace client.
     */
    public function page(Request $request): Response
    {
        $user = $request->user();
        $team = $user->getActiveTeam();

        // Les alertes de compte (abonnement, stockage) sont évaluées à
        // l'ouverture du centre pour rester visibles sans tâche planifiée.
        if ($team) {
            $this->notifications->scanAccountAlerts($team);
        }

        $filters = $this->buildFilters($request);

        $query = $user->notifications();

        if ($filters['status'] === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filters['status'] === 'read') {
            $query->whereNotNull('read_at');
        }

        if ($filters['type']) {
            $query->where('data->type', $filters['type']);
        }

        $notifications = $query
            ->paginate(20)
            ->withQueryString()
            ->through(fn (DatabaseNotification $notification) => $this->notifications->present($notification));

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => $filters,
            'types' => NotificationService::TYPES,
            'stats' => [
                'total' => $user->notifications()->count(),
                'unread' => $user->unreadNotifications()->count(),
                'today' => $user->notifications()->whereDate('created_at', today())->count(),
            ],
        ]);
    }

    /**
     * Ouvrir une notification : la marquer comme lue puis suivre son lien.
     */
    public function open(Request $request, string $notification): RedirectResponse
    {
        $notification = $this->findForUser($request, $notification);

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        $url = $notification->data['url'] ?? null;

        return $url
            ? redirect()->to($url)
            : redirect()->route('notifications.index');
    }

    /**
     * Marquer une notification comme lue sans quitter la page.
     */
    public function read(Request $request, string $notification): RedirectResponse
    {
        $this->findForUser($request, $notification)->markAsRead();

        return back();
    }

    /**
     * Tout marquer comme lu.
     */
    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'Toutes les notifications ont été marquées comme lues.');
    }

    /**
     * Supprimer une notification.
     */
    public function destroy(Request $request, string $notification): RedirectResponse
    {
        $this->findForUser($request, $notification)->delete();

        return back()->with('success', 'Notification supprimée.');
    }

    // ============================================================
    // API (Sanctum)
    // ============================================================

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'notifications' => $user->notifications()
                ->limit(50)
                ->get()
                ->map(fn (DatabaseNotification $notification) => $this->notifications->present($notification)),
        ]);
    }

    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        $notification = $this->findForUser($request, $notification);
        $notification->markAsRead();

        return response()->json([
            'notification' => $this->notifications->present($notification->fresh()),
            'status' => 'read',
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'status' => 'all_read',
        ]);
    }

    // ============================================================
    // FILTRES
    // ============================================================

    /**
     * @return array{status: string|null, type: string|null}
     */
    private function buildFilters(Request $request): array
    {
        $status = (string) $request->input('status', 'all');

        if (! in_array($status, ['all', 'unread', 'read'], true)) {
            $status = 'all';
        }

        $type = (string) $request->input('type', '');

        if (! array_key_exists($type, NotificationService::TYPES)) {
            $type = '';
        }

        return [
            'status' => $status === 'all' ? null : $status,
            'type' => $type ?: null,
        ];
    }

    /**
     * Récupérer une notification en la limitant à son destinataire.
     */
    private function findForUser(Request $request, string $notification): DatabaseNotification
    {
        return $request->user()
            ->notifications()
            ->whereKey($notification)
            ->firstOrFail();
    }
}
