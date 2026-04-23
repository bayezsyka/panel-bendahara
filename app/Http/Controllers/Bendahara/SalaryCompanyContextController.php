<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Services\SalaryCompanyContextService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SalaryCompanyContextController extends Controller
{
    public function update(Request $request, SalaryCompanyContextService $salaryCompanyContextService): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:salary_companies,id'],
        ]);

        $salaryCompanyContextService->setCurrentCompanyId((int) $validated['company_id']);

        return redirect()->back();
    }
}
