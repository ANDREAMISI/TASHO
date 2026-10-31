<?php

namespace App\Http\Middleware;

use App\Services\BillingSummaryService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            // Plan et stockage de l'espace client, résolus à la demande.
            'billing' => fn () => $user && ! $user->isSuperAdmin()
                ? app(BillingSummaryService::class)->forUser($user)
                : null,
            // Préférences d'interface de l'utilisateur connecté.
            'preferences' => fn () => $user?->preferences,
            // Compteur et dernières notifications pour la cloche.
            'notificationsSummary' => fn () => $user
                ? app(\App\Services\NotificationService::class)->summaryFor($user)
                : ['unread_count' => 0, 'recent' => []],
        ];
    }
}
