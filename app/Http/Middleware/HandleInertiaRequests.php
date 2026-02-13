<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'current_office' => $request->user() ? [
                    'id' => app(\App\Services\OfficeContextService::class)->getCurrentOfficeId(),
                    'name' => app(\App\Services\OfficeContextService::class)->getOfficeName(),
                ] : null,
                'can_switch_office' => $request->user() ? $request->user()->isSuperAdmin() : false,
                'can_manage_projects' => $request->user() ? !($request->user()->isSuperAdmin() && $request->user()->office_id === 2) : false,
            ],

            'flash' => [
                'success' => fn() => session('success'),
                'error' => fn() => session('error'),
                'message' => fn() => session('message'),
            ]
        ];
    }
}
