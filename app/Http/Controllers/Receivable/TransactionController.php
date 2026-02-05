<?php

namespace App\Http\Controllers\Receivable;

use App\Http\Controllers\Controller;
use App\Models\ReceivableTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'grade' => 'nullable|string|max:50',
            'volume' => 'nullable|numeric|min:0',
            'price_per_m3' => 'nullable|numeric|min:0',
            'bill_amount' => 'nullable|numeric|min:0',
            'payment_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        ReceivableTransaction::create([
            'customer_id' => $validated['customer_id'],
            'date' => $validated['date'],
            'description' => $validated['description'],
            'grade' => $validated['grade'] ?? null,
            'volume' => $validated['volume'] ?? null,
            'price_per_m3' => $validated['price_per_m3'] ?? null,
            'bill_amount' => $validated['bill_amount'] ?? 0,
            'payment_amount' => $validated['payment_amount'] ?? 0,
            'notes' => $validated['notes'],
            'office_id' => 1, // Default office
        ]);

        return Redirect::back()->with('message', 'Transaksi berhasil ditambahkan.');
    }

    public function update(Request $request, ReceivableTransaction $transaction)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'grade' => 'nullable|string|max:50',
            'volume' => 'nullable|numeric|min:0',
            'price_per_m3' => 'nullable|numeric|min:0',
            'bill_amount' => 'nullable|numeric|min:0',
            'payment_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $transaction->update([
            'date' => $validated['date'],
            'description' => $validated['description'],
            'grade' => $validated['grade'] ?? null,
            'volume' => $validated['volume'] ?? null,
            'price_per_m3' => $validated['price_per_m3'] ?? null,
            'bill_amount' => $validated['bill_amount'] ?? 0,
            'payment_amount' => $validated['payment_amount'] ?? 0,
            'notes' => $validated['notes'],
        ]);

        return Redirect::back()->with('message', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(ReceivableTransaction $transaction)
    {
        $transaction->delete();
        return Redirect::back()->with('message', 'Transaksi berhasil dihapus.');
    }
}
