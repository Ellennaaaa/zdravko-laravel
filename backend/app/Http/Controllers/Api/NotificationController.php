<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function index(Request $request)
    {
        return $this->respond([
            'notifications' => $request->user()
                ->notifications()
                ->latest()
                ->get(),
        ]);
    }

    public function unread(Request $request)
    {
        return $this->respond([
            'notifications' => $request->user()
                ->unreadNotifications()
                ->latest()
                ->get(),
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (! $notification) {
            return $this->respondNotFound('Notification not found.');
        }

        $notification->markAsRead();

        return $this->respond([
            'message' => 'Notification marked as read.',
        ]);
    }
}