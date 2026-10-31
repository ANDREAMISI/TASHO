<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Notification in-app générique.
 *
 * Un seul type de notification est stocké en base ; le champ `type` du
 * payload permet à l'interface de choisir l'icône, la couleur et le libellé.
 */
class AppNotification extends Notification
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(private array $payload)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->payload;
    }
}
