<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Team;
use App\Services\ClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ClientController extends Controller
{
    protected ClientService $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * Afficher la liste des clients
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return redirect()->route('team.create')
                ->with('info', 'Créez une équipe pour gérer vos clients.');
        }

        $query = Client::where('team_id', $team->id);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('email', 'LIKE', '%' . $request->search . '%')
                  ->orWhere('company', 'LIKE', '%' . $request->search . '%');
            });
        }

        $clients = $query->withCount(['projects', 'accesses'])
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->through(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'company' => $client->company,
                    'avatar' => $client->avatar,
                    'projects_count' => $client->projects_count,
                    'accesses_count' => $client->accesses_count,
                    'last_interaction_at' => $client->last_interaction_at,
                    'created_at' => $client->created_at,
                ];
            });

        return Inertia::render('Client/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search']),
            'team' => $team,
        ]);
    }

    /**
     * Créer un client
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $team = $user->teams()->first();

        if (!$team) {
            return back()->withErrors(['message' => 'Aucune équipe trouvée.']);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $client = $this->clientService->createClient(
            $team,
            $request->all(),
            $user
        );

        return back()->with('success', 'Client créé avec succès !');
    }

    /**
     * Mettre à jour un client
     */
    public function update(Request $request, Client $client)
    {
        Gate::authorize('update', $client);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email,' . $client->id,
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $client->update($request->all());

        return back()->with('success', 'Client mis à jour avec succès !');
    }

    /**
     * Supprimer un client
     */
    public function destroy(Client $client)
    {
        Gate::authorize('delete', $client);

        $client->delete();

        return back()->with('success', 'Client supprimé avec succès !');
    }
}