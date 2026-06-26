<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'notifications' => [],
        ]);
    }

    public function markAsRead(Request $request, $notification): JsonResponse
    {
        return response()->json([
            'notification' => $notification,
            'status' => 'read',
        ]);
    }

    public function markAllAsRead(): JsonResponse
    {
        return response()->json([
            'status' => 'all_read',
        ]);
    }
}
