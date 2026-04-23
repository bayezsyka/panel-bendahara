<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\SalaryComponentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryComponentTypeController extends Controller
{
    public function incomeIndex(): Response
    {
        return $this->renderIndex(SalaryComponentType::TYPE_INCOME);
    }

    public function deductionIndex(): Response
    {
        return $this->renderIndex(SalaryComponentType::TYPE_DEDUCTION);
    }

    public function storeIncome(Request $request): RedirectResponse
    {
        return $this->store($request, SalaryComponentType::TYPE_INCOME);
    }

    public function storeDeduction(Request $request): RedirectResponse
    {
        return $this->store($request, SalaryComponentType::TYPE_DEDUCTION);
    }

    public function updateIncome(Request $request, SalaryComponentType $componentType): RedirectResponse
    {
        return $this->update($request, $componentType, SalaryComponentType::TYPE_INCOME);
    }

    public function updateDeduction(Request $request, SalaryComponentType $componentType): RedirectResponse
    {
        return $this->update($request, $componentType, SalaryComponentType::TYPE_DEDUCTION);
    }

    public function destroyIncome(SalaryComponentType $componentType): RedirectResponse
    {
        return $this->destroy($componentType, SalaryComponentType::TYPE_INCOME);
    }

    public function destroyDeduction(SalaryComponentType $componentType): RedirectResponse
    {
        return $this->destroy($componentType, SalaryComponentType::TYPE_DEDUCTION);
    }

    private function renderIndex(string $type): Response
    {
        $types = SalaryComponentType::query()
            ->where('type', $type)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Kas/SlipGaji/ComponentTypes/Index', [
            'mode' => $type,
            'types' => $types,
        ]);
    }

    private function store(Request $request, string $type): RedirectResponse
    {
        $validated = $this->validateRequest($request, $type);

        SalaryComponentType::query()->create([
            'name' => $validated['name'],
            'type' => $type,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->back()->with('message', $this->getTypeLabel($type).' berhasil ditambahkan.');
    }

    private function update(Request $request, SalaryComponentType $componentType, string $type): RedirectResponse
    {
        abort_unless($componentType->type === $type, 404);

        $validated = $this->validateRequest($request, $type, $componentType->id);

        $componentType->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->back()->with('message', $this->getTypeLabel($type).' berhasil diperbarui.');
    }

    private function destroy(SalaryComponentType $componentType, string $type): RedirectResponse
    {
        abort_unless($componentType->type === $type, 404);

        try {
            $componentType->delete();

            return redirect()->back()->with('message', $this->getTypeLabel($type).' berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $exception) {
            if ($exception->getCode() === '23000') {
                return redirect()->back()->withErrors([
                    'error' => 'Tipe tidak bisa dihapus karena sudah dipakai dalam slip gaji.',
                ]);
            }

            throw $exception;
        }
    }

    private function validateRequest(Request $request, string $type, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('salary_component_types', 'name')
                    ->where(fn ($query) => $query->where('type', $type))
                    ->ignore($ignoreId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    private function getTypeLabel(string $type): string
    {
        return $type === SalaryComponentType::TYPE_INCOME ? 'Tipe pendapatan' : 'Tipe potongan';
    }
}
