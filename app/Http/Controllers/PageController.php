<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Afficher la page d'accueil
     */
    public function home()
    {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
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
        return Inertia::render('Pricing');
    }
}