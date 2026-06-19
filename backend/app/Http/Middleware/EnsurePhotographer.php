<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhotographer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->isPhotographer()) {
            return response()->json([
                'message' => 'Acceso restringido a fotógrafos.',
                'error' => 'forbidden_role',
            ], 403);
        }

        return $next($request);
    }
}
