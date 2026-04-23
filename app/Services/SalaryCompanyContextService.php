<?php

namespace App\Services;

use App\Models\SalaryCompany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Session;

class SalaryCompanyContextService
{
    public function getAvailableCompanies(): Collection
    {
        return SalaryCompany::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function getCurrentCompany(): ?SalaryCompany
    {
        $companies = $this->getAvailableCompanies();
        if ($companies->isEmpty()) {
            return null;
        }

        $currentCompanyId = Session::get('salary_company_id');
        $currentCompany = $companies->firstWhere('id', $currentCompanyId);

        if ($currentCompany) {
            return $currentCompany;
        }

        $fallbackCompany = $companies->first();
        Session::put('salary_company_id', $fallbackCompany->id);

        return $fallbackCompany;
    }

    public function getCurrentCompanyId(): ?int
    {
        return $this->getCurrentCompany()?->id;
    }

    public function setCurrentCompanyId(int $companyId): void
    {
        $company = $this->getAvailableCompanies()->firstWhere('id', $companyId);

        if ($company) {
            Session::put('salary_company_id', $company->id);
        }
    }
}
