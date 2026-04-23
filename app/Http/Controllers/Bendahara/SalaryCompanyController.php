<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\SalaryCompany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryCompanyController extends Controller
{
    public function index(): Response
    {
        $companies = SalaryCompany::query()
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        return Inertia::render('Kas/SlipGaji/Companies/Index', [
            'companies' => $companies,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateRequest($request);

        $company = SalaryCompany::query()->create([
            'name' => $validated['name'],
            'direktur' => $validated['direktur'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('message', 'Perusahaan berhasil ditambahkan.');
    }

    public function update(Request $request, SalaryCompany $company): RedirectResponse
    {
        $validated = $this->validateRequest($request, $company->id);

        $company->update([
            'name' => $validated['name'],
            'direktur' => $validated['direktur'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('message', 'Perusahaan berhasil diperbarui.');
    }

    public function destroy(SalaryCompany $company): RedirectResponse
    {
        try {
            $company->delete();

            return redirect()->back()->with('message', 'Perusahaan berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $exception) {
            if ($exception->getCode() === '23000') {
                return redirect()->back()->withErrors([
                    'error' => 'Perusahaan tidak bisa dihapus karena sudah dipakai pada slip gaji.',
                ]);
            }

            throw $exception;
        }
    }

    private function validateRequest(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', \Illuminate\Validation\Rule::unique('salary_companies', 'name')->ignore($ignoreId)],
            'direktur' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);
    }
}
