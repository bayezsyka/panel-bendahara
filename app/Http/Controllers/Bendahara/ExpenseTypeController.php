<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\ExpenseType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseTypeController extends Controller
{
    public function index()
    {
        $expenseTypes = ExpenseType::latest()->get();

        return Inertia::render('Bendahara/ExpenseTypes/Index', [
            'expenseTypes' => $expenseTypes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:expense_types,name',
            'code' => 'nullable|string|max:50',
        ], [
            'name.unique' => 'Nama Tipe Biaya sudah ada.',
        ]);

        ExpenseType::create($validated);

        return redirect()->back()->with('message', 'Tipe Biaya Berhasil Ditambahkan');
    }

    public function update(Request $request, ExpenseType $expenseType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:expense_types,name,' . $expenseType->id,
            'code' => 'nullable|string|max:50',
        ], [
            'name.unique' => 'Nama Tipe Biaya sudah ada.',
        ]);

        $expenseType->update($validated);

        return redirect()->back()->with('message', 'Tipe Biaya Berhasil Diperbarui');
    }

    public function destroy(ExpenseType $expenseType)
    {
        $expenseType->delete();
        return redirect()->back()->with('message', 'Tipe Biaya Berhasil Dihapus');
    }
}
