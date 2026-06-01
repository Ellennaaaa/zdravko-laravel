<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $isAdmin = $request->user()
            ->roles()
            ->where('name', 'admin')
            ->exists();

        if (! $isAdmin) {
            return response()->json([
                'message' => 'Only admins can access this.'
            ], 403);
        }

        return $next($request);
    }
}