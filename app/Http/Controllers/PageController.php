<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Récupérer les plans actifs à afficher côté public.
     */
    private function publicPlans(): array
    {
        return Plan::active()
            ->ordered()
            ->get()
            ->map(fn (Plan $plan) => $plan->toPublicArray())
            ->values()
            ->all();
    }

    /**
     * Afficher la page d'accueil
     */
    public function home()
    {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'plans' => $this->publicPlans(),
        ]);
    }

    /**
     * Afficher la page des fonctionnalités
     */
    public function features()
    {
        return Inertia::render('Features');
    }

    /**
     * Afficher la page des tarifs
     */
    public function pricing()
    {
        return Inertia::render('Pricing', [
            'plans' => $this->publicPlans(),
        ]);
    }
}
