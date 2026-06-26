<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('query');

        return response()->json([
            'query' => $query,
            'results' => [],
        ]);
    }
}
