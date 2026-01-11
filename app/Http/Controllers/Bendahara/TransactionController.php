<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['type', 'q', 'from', 'to']);

        $query = Transaction::query();

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['q'])) {
            $query->where('description', 'like', '%' . $filters['q'] . '%');
        }

        if (!empty($filters['from'])) {
            $query->whereDate('transacted_at', '>=', $filters['from']);
        }

        if (!empty($filters['to'])) {
            $query->whereDate('transacted_at', '<=', $filters['to']);
        }

        $transactions = $query
            ->orderByDesc('transacted_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Bendahara/Transactions/Index', [
            'filters' => $filters,
            'transactions' => $transactions,
        ]);
    }

    public function create()
    {
        return Inertia::render('Bendahara/Transactions/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'transacted_at' => ['required', 'date'],
        ]);

        $data['created_by'] = $request->user()->id;

        Transaction::create($data);

        return redirect()
            ->route('bendahara.transactions.index')
            ->with('success', 'Transaksi berhasil dibuat.');
    }

    public function edit(Transaction $transaction)
    {
        return Inertia::render('Bendahara/Transactions/Edit', [
            'transaction' => $transaction,
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $data = $request->validate([
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'transacted_at' => ['required', 'date'],
        ]);

        $transaction->update($data);

        return redirect()
            ->route('bendahara.transactions.index')
            ->with('success', 'Transaksi berhasil diupdate.');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return redirect()
            ->back()
            ->with('success', 'Transaksi berhasil dihapus.');
    }
}
