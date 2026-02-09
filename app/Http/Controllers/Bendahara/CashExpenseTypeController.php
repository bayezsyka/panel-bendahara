<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\CashExpenseType;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CashExpenseTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $types = CashExpenseType::orderBy('name')->get();
        return Inertia::render('Cash/ExpenseTypes/Index', [
            'types' => $types,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:cash_expense_types',
            'description' => 'nullable|string',
        ]);

        CashExpenseType::create($request->all());

        return redirect()->back()->with('message', 'Tipe Biaya Kas berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CashExpenseType $cashExpenseType)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:cash_expense_types,name,' . $cashExpenseType->id,
            'description' => 'nullable|string',
        ]);

        $cashExpenseType->update($request->all());

        return redirect()->back()->with('message', 'Tipe Biaya Kas berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CashExpenseType $cashExpenseType)
    {
        try {
            $cashExpenseType->delete();
            return redirect()->back()->with('message', 'Tipe Biaya Kas berhasil dihapus');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()->back()->withErrors(['error' => 'Data tidak dapat dihapus karena sedang digunakan dalam transaksi.']);
            }
            throw $e;
        }
    }
}
