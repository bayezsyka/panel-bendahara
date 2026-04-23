<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\SalaryEmployee;
use App\Services\SalaryCompanyContextService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryEmployeeController extends Controller
{
    public function index(SalaryCompanyContextService $salaryCompanyContextService): Response
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();

        $employees = $currentCompany
            ? $currentCompany->employees()
                ->orderBy('name')
                ->get(['id', 'salary_company_id', 'name', 'nik', 'jabatan', 'is_active'])
            : collect();

        return Inertia::render('Kas/SlipGaji/Employees/Index', [
            'selectedCompany' => $currentCompany ? [
                'id' => $currentCompany->id,
                'name' => $currentCompany->name,
                'description' => $currentCompany->description,
            ] : null,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request, SalaryCompanyContextService $salaryCompanyContextService): RedirectResponse
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();

        if (! $currentCompany) {
            return redirect()->back()->withErrors(['error' => 'Pilih perusahaan aktif terlebih dahulu.']);
        }

        $validated = $this->validateRequest($request);

        $currentCompany->employees()->create([
            'name' => $validated['name'],
            'nik' => $validated['nik'] ?? null,
            'jabatan' => $validated['jabatan'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('message', 'Pegawai berhasil ditambahkan.');
    }

    public function update(Request $request, SalaryEmployee $employee, SalaryCompanyContextService $salaryCompanyContextService): RedirectResponse
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();
        abort_unless($currentCompany && $employee->salary_company_id === $currentCompany->id, 404);

        $validated = $this->validateRequest($request);

        $employee->update([
            'name' => $validated['name'],
            'nik' => $validated['nik'] ?? null,
            'jabatan' => $validated['jabatan'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('message', 'Pegawai berhasil diperbarui.');
    }

    public function destroy(SalaryEmployee $employee, SalaryCompanyContextService $salaryCompanyContextService): RedirectResponse
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();
        abort_unless($currentCompany && $employee->salary_company_id === $currentCompany->id, 404);

        try {
            $employee->delete();

            return redirect()->back()->with('message', 'Pegawai berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $exception) {
            if ($exception->getCode() === '23000') {
                return redirect()->back()->withErrors([
                    'error' => 'Pegawai tidak bisa dihapus karena sudah dipakai pada slip gaji.',
                ]);
            }

            throw $exception;
        }
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nik' => ['nullable', 'string', 'max:100'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);
    }
}
