<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'transacted_at' => 'required|date',
            'receipt_image' => 'nullable|image|max:2048',
            'description' => 'nullable|string',
        ]);

        $data = $request->except('receipt_image');
        if ($request->hasFile('receipt_image')) {
            $path = $request->file('receipt_image')->store('receipts', 'public');
            $data['receipt_image'] = $path;
        }

        Expense::create($data);
        return redirect()->back()->with('message', 'Pengeluaran Berhasil Dicatat');
    }

    public function destroy(Expense $expense)
    {
        // Hapus foto struk jika ada
        if ($expense->receipt_image) {
            Storage::disk('public')->delete($expense->receipt_image);
        }

        $expense->delete();

        return redirect()->back()->with('message', 'Pengeluaran dihapus.');
    }
}
