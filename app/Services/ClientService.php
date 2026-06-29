<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Team;
use App\Models\User;
use App\Models\AccessLog;
use Illuminate\Support\Str;

class ClientService
{
    /**
     * Créer un nouveau client
     */
    public function createClient(Team $team, array $data, ?User $user = null): Client
    {
        $client = Client::create([
            'team_id' => $team->id,
            'user_id' => $user?->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'notes' => $data['notes'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        // Log l'activité
        if ($user) {
            AccessLog::create([
                'user_id' => $user->id,
                'client_id' => $client->id,
                'team_id' => $team->id,
                'action' => 'create_client',
                'details' => json_encode([
                    'client_name' => $client->name,
                    'client_email' => $client->email,
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return $client;
    }

    /**
     * Mettre à jour un client
     */
    public function updateClient(Client $client, array $data, ?User $user = null): Client
    {
        $client->update($data);

        // Log l'activité
        if ($user) {
            AccessLog::create([
                'user_id' => $user->id,
                'client_id' => $client->id,
                'team_id' => $client->team_id,
                'action' => 'update_client',
                'details' => json_encode([
                    'client_name' => $client->name,
                    'client_email' => $client->email,
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return $client;
    }

    /**
     * Supprimer un client
     */
    public function deleteClient(Client $client, ?User $user = null): bool
    {
        // Log l'activité avant suppression
        if ($user) {
            AccessLog::create([
                'user_id' => $user->id,
                'client_id' => $client->id,
                'team_id' => $client->team_id,
                'action' => 'delete_client',
                'details' => json_encode([
                    'client_name' => $client->name,
                    'client_email' => $client->email,
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return $client->delete();
    }

    /**
     * Rechercher des clients
     */
    public function searchClients(Team $team, string $search, int $limit = 10)
    {
        return Client::where('team_id', $team->id)
            ->where(function ($query) use ($search) {
                $query->where('name', 'LIKE', '%' . $search . '%')
                    ->orWhere('email', 'LIKE', '%' . $search . '%')
                    ->orWhere('company', 'LIKE', '%' . $search . '%')
                    ->orWhere('phone', 'LIKE', '%' . $search . '%');
            })
            ->limit($limit)
            ->get();
    }

    /**
     * Obtenir les statistiques des clients
     */
    public function getClientStats(Team $team): array
    {
        $total = $team->clients()->count();
        $active = $team->clients()
            ->where('last_interaction_at', '>=', now()->subDays(30))
            ->count();
        $new = $team->clients()
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return [
            'total' => $total,
            'active' => $active,
            'new' => $new,
            'conversion_rate' => $total > 0 ? round(($active / $total) * 100, 1) : 0,
        ];
    }

    /**
     * Mettre à jour la dernière interaction
     */
    public function updateLastInteraction(Client $client): void
    {
        $client->update([
            'last_interaction_at' => now(),
        ]);
    }

    /**
     * Obtenir les clients avec leurs projets
     */
    public function getClientsWithProjects(Team $team, int $limit = 10)
    {
        return Client::where('team_id', $team->id)
            ->withCount(['projects', 'accesses'])
            ->orderBy('last_interaction_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Vérifier si un client existe déjà
     */
    public function clientExists(Team $team, string $email): bool
    {
        return Client::where('team_id', $team->id)
            ->where('email', $email)
            ->exists();
    }

    /**
     * Trouver un client par email
     */
    public function findByEmail(Team $team, string $email): ?Client
    {
        return Client::where('team_id', $team->id)
            ->where('email', $email)
            ->first();
    }

    /**
     * Créer ou mettre à jour un client
     */
    public function createOrUpdate(Team $team, array $data, ?User $user = null): Client
    {
        $client = Client::where('team_id', $team->id)
            ->where('email', $data['email'])
            ->first();

        if ($client) {
            return $this->updateClient($client, $data, $user);
        }

        return $this->createClient($team, $data, $user);
    }

    /**
     * Exporter les clients en CSV
     */
    public function exportClients(Team $team): string
    {
        $clients = Client::where('team_id', $team->id)->get();
        
        $csv = "Nom,Email,Téléphone,Entreprise,Dernière interaction\n";
        
        foreach ($clients as $client) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s\n",
                $client->name,
                $client->email,
                $client->phone ?? '',
                $client->company ?? '',
                $client->last_interaction_at?->format('Y-m-d') ?? ''
            );
        }

        return $csv;
    }
}