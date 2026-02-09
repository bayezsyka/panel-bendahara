<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlantAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is from Plant Office (ID 2)
        if ($user && $user->office_id === 2) {

            // Rule 1: Bendahara Plant cannot access Project Expense at all
            if ($user->role === 'bendahara') {
                // If the route is not explicitly allowed for bendahara plant (e.g. export/print might be allowed? No, user said "gabisa buka tampilan")
                // We assume this middleware is applied to 'projectexpense.*' group.
                // Note: 'projectexpense.overview' is dashboard. If they can't open project expense, where do they go?
                // They should go to 'bendahara.plant.kas-besar' probably.
                // But if they try to access, we abort 403.
                abort(403, 'Akses Ditolak: Bendahara Plant tidak memiliki akses ke Project Expense.');
            }

            // Rule 2 & 3: Superadmin Plant (and potentially others in Plant if any)
            // "Superadmin punya akses view only, tapi dia tidak bisa ubah data samsek"
            if ($user->role === 'superadmin') {
                // Allow safe methods: GET, HEAD
                if (in_array($request->method(), ['GET', 'HEAD'])) {
                    return $next($request);
                }

                // Block unsafe methods: POST, PUT, PATCH, DELETE
                abort(403, 'Akses Ditolak: Superadmin Plant hanya memiliki akses lihat (View Only).');
            }
        }

        return $next($request);
    }
}
