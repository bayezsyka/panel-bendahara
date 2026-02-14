<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictInputOnlyUsers
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isRestrictedToInputOnly()) {
            // Allow only GET (read), POST (create)
            // Block PUT, PATCH, DELETE
            if (in_array($request->method(), ['PUT', 'PATCH', 'DELETE'])) {
                abort(403, 'Akses Ditolak: Anda hanya memiliki izin untuk menginput data, tidak untuk mengubah atau menghapus.');
            }

            // Also, some GET requests might be for "Edit" pages. 
            // Ideally we check route names, but checking method is a good safety net.
            // If the controller uses the same method for 'edit' (GET), we need to block it potentially.
            // But blocking GET might block 'show'. 
            // Usually 'edit' routes end in /edit.
            if ($request->is('*/edit')) {
                abort(403, 'Akses Ditolak: Anda tidak memiliki izin untuk mengedit data.');
            }
        }

        return $next($request);
    }
}
