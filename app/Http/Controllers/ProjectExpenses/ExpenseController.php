<?php

namespace App\Http\Controllers\ProjectExpenses;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB; // PENTING: Import DB Facade

class ExpenseController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'expense_type_id' => 'required|exists:expense_types,id', // Wajib Tipe Biaya
            'title' => 'nullable|string|max:255',
            'transacted_at' => 'required|date',
            'receipt_image' => 'nullable|image|max:2048',
            'description' => 'nullable|string',

            // Validasi Array Items
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $data = $request->except(['receipt_image', 'items']);

            if ($request->hasFile('receipt_image')) {
                $path = $request->file('receipt_image')->store('receipts', 'public');
                $data['receipt_image'] = $path;
            }

            // Hitung ulang total amount dari server-side untuk keamanan
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += ($item['quantity'] * $item['price']);
            }
            $data['amount'] = $totalAmount;

            // 1. Buat Header Pengeluaran (Nota)
            $expense = Expense::create($data);

            // 2. Buat Detail Item Pengeluaran
            foreach ($request->items as $item) {
                $expense->items()->create([
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $item['quantity'] * $item['price'],
                ]);
            }
        });

        return redirect()->back()->with('message', 'Pengeluaran Berhasil Dicatat');
    }

    public function update(Request $request, Expense $expense)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'expense_type_id' => 'required|exists:expense_types,id', // Wajib Tipe Biaya
            'title' => 'nullable|string|max:255',
            'transacted_at' => 'required|date',
            'receipt_image' => 'nullable|image|max:2048',
            'description' => 'nullable|string',

            // Validasi Array Items
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $expense) {
            $data = $request->except(['receipt_image', 'items', '_method']); // Exclude _method from data

            if ($request->hasFile('receipt_image')) {
                // Hapus foto lama jika ada
                if ($expense->receipt_image) {
                    Storage::disk('public')->delete($expense->receipt_image);
                }
                $path = $request->file('receipt_image')->store('receipts', 'public');
                $data['receipt_image'] = $path;
            }

            // Hitung ulang total amount
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += ($item['quantity'] * $item['price']);
            }
            $data['amount'] = $totalAmount;

            // Update Expense
            $expense->update($data);

            // Sync Items: Hapus semua dan buat ulang
            $expense->items()->delete();
            foreach ($request->items as $item) {
                $expense->items()->create([
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $item['quantity'] * $item['price'],
                ]);
            }
        });

        return redirect()->back()->with('message', 'Pengeluaran Berhasil Diupdate');
    }

    public function destroy(Expense $expense)
    {
        if ($expense->receipt_image) {
            Storage::disk('public')->delete($expense->receipt_image);
        }

        $expense->delete();

        return redirect()->back()->with('message', 'Pengeluaran dihapus.');
    }

    public function print(Expense $expense)
    {
        $expense->load(['project', 'expenseType', 'items', 'project.mandor', 'project.mandors']);

        // Determine Pay To (Mandor Name)
        // If project has multiple mandors, maybe list primary or all? 
        // For now, let's try to get from project->mandor (legacy) or first of mandors
        $payTo = '-';
        if ($expense->project) {
            if ($expense->project->mandor) {
                $payTo = $expense->project->mandor->name;
            } elseif ($expense->project->mandors->count() > 0) {
                $payTo = $expense->project->mandors->first()->name;
            }
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.voucher.kwitansi', [
            'expense' => $expense,
            'payTo' => $payTo
        ]);

        return $pdf->stream('kwitansi-' . $expense->id . '.pdf');
    }
}
