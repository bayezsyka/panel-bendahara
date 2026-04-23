<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\SalaryCompanyContextService;
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
        $salaryCompanyContext = null;

        if ($request->user() && $request->user()->canAccessPanel(User::PANEL_SLIP_GAJI)) {
            $salaryCompanyContextService = app(SalaryCompanyContextService::class);
            $companies = $salaryCompanyContextService->getAvailableCompanies();
            $currentCompany = $salaryCompanyContextService->getCurrentCompany();

            $salaryCompanyContext = [
                'companies' => $companies->map(fn ($company) => [
                    'id' => $company->id,
                    'name' => $company->name,
                ])->values(),
                'current_company_id' => $currentCompany?->id,
                'current_company_name' => $currentCompany?->name,
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'current_office' => $request->user() ? [
                    'id' => app(\App\Services\OfficeContextService::class)->getCurrentOfficeId(),
                    'name' => app(\App\Services\OfficeContextService::class)->getOfficeName(),
                ] : null,
                'can_switch_office' => $request->user() ? $request->user()->isSuperAdmin() : false,
                'permissions' => $request->user() ? [
                    'can_create' => true,
                    'can_edit' => ! $request->user()->isRestrictedToInputOnly(),
                    'can_delete' => ! $request->user()->isRestrictedToInputOnly(),
                ] : [],
            ],

            'flash' => [
                'success' => fn () => session('success'),
                'error' => fn () => session('error'),
                'message' => fn () => session('message'),
                'created_slip_gaji_id' => fn () => session('created_slip_gaji_id'),
                'created_slip_gaji_uuid' => fn () => session('created_slip_gaji_uuid'),
            ],
            'salary_company_context' => $salaryCompanyContext,
        ];
    }
}
