<?php

namespace App\Http\Controllers\ProjectExpenses;

use App\Http\Controllers\Controller;
use App\Models\ExpenseType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

use App\Services\OfficeContextService;

class ExpenseTypeController extends Controller
{
    public function index()
    {
        $officeId = app(OfficeContextService::class)->getCurrentOfficeId();
        $expenseTypes = ExpenseType::where('office_id', $officeId)->latest()->get();

        return Inertia::render('ProjectExpenses/ExpenseTypes/Index', [
            'expenseTypes' => $expenseTypes,
            'currentOfficeId' => $officeId
        ]);
    }

    public function store(Request $request)
    {
        $officeId = app(OfficeContextService::class)->getCurrentOfficeId();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                // Unique per office
                Rule::unique('expense_types')->where(function ($query) use ($officeId) {
                    return $query->where('office_id', $officeId);
                })
            ],
            'code' => 'nullable|string|max:50',
            'category' => 'nullable|in:in,out',
        ], [
            'name.unique' => 'Nama Tipe sudah ada di kantor ini.',
        ]);

        $validated['office_id'] = $officeId;

        // Force category based on office
        if ($officeId === 1) {
            $validated['category'] = 'out'; // Strictly out (pengeluaran) for main office
        } else {
            if (!isset($validated['category'])) {
                $validated['category'] = 'out'; // Default for plant if not specified
            }
        }

        ExpenseType::create($validated);

        return redirect()->back()->with('message', 'Tipe Berhasil Ditambahkan');
    }

    public function update(Request $request, ExpenseType $expenseType)
    {
        $officeId = app(OfficeContextService::class)->getCurrentOfficeId();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                // Unique per office, ignore current id
                Rule::unique('expense_types')->where(function ($query) use ($officeId) {
                    return $query->where('office_id', $officeId);
                })->ignore($expenseType->id)
            ],
            'code' => 'nullable|string|max:50',
            'category' => 'nullable|in:in,out',
        ], [
            'name.unique' => 'Nama Tipe sudah ada di kantor ini.',
        ]);

        if ($officeId === 1) {
            $validated['category'] = 'out';
        }

        // Ensure office_id stays consistent or update it? Usually stays.
        $expenseType->update($validated);

        return redirect()->back()->with('message', 'Tipe Berhasil Diperbarui');
    }

    public function destroy(ExpenseType $expenseType)
    {
        $expenseType->delete();
        return redirect()->back()->with('message', 'Tipe Berhasil Dihapus');
    }
}
