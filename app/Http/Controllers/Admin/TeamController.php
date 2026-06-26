<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Support\Facades\Gate;

class TeamController extends Controller
{
    public function index()
    {
        Gate::authorize('is-super-admin');

        $teams = Team::paginate(15);

        return view('admin.teams.index', compact('teams'));
    }

    public function show(Team $team)
    {
        Gate::authorize('is-super-admin');

        return view('admin.teams.show', compact('team'));
    }

    public function destroy(Team $team)
    {
        Gate::authorize('is-super-admin');

        $team->delete();

        return redirect()->route('admin.teams.index')->with('success', 'Équipe supprimée.');
    }
}
