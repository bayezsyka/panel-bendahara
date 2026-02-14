<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePanelAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $panel): Response
    {
        $user = $request->user();

        if (!$user || !$user->canAccessPanel($panel)) {
            abort(403, 'Akses Ditolak: Anda tidak memiliki akses ke panel ini.');
        }

        return $next($request);
    }
}
