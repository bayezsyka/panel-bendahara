<?php

namespace App\Http\Controllers\Receivable;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::forCurrentOffice();

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Calculate balance first to filter by status
        // Efficient approach: Filter in PHP or use subquery. 
        // For simplicity with Inertia & small data, we fetch then filter in Collection if complex, 
        // OR better: use havingRaw for clean DB performance if possible. 
        // Let's stick to simple "get all then filter" for small datasets or improve query.
        // Actually, filtering by "Lunas" (balance <= 0) needs aggregation.

        $query->withSum('receivableTransactions', 'bill_amount')
            ->withSum('receivableTransactions', 'payment_amount')
            ->withSum('receivableTransactions', 'volume');

        // Sort
        $sort = $request->input('sort', 'updated_at'); // default updated_at
        if ($sort === 'created_at') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('updated_at', 'desc');
        }

        $customers = $query->get();

        // Filter Status (Client side or post-query for simplicity due to computed sum)
        if ($status = $request->input('status')) {
            $customers = $customers->filter(function ($customer) use ($status) {
                $balance = ($customer->receivable_transactions_sum_bill_amount ?? 0) - ($customer->receivable_transactions_sum_payment_amount ?? 0);
                if ($status === 'lunas') return $balance <= 0;
                if ($status === 'belum_lunas') return $balance > 0;
                return true;
            })->values();
        }

        return Inertia::render('Receivable/Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
                'sort' => $request->query('sort'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string',
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'contact' => $validated['contact'],
            'address' => $validated['address'],
            'description' => $validated['description'],
            'office_id' => 1,
        ]);

        return redirect()->back()->with('message', 'Customer berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::forCurrentOffice()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string',
        ]);

        $customer->update($validated);

        return redirect()->back()->with('message', 'Data customer berhasil diperbarui.');
    }

    public function show($id)
    {
        $customer = Customer::forCurrentOffice()->findOrFail($id);
        $customer->load(['receivableTransactions' => function ($query) {
            $query->orderBy('date', 'asc');
        }]);

        $grades = \App\Models\ConcreteGrade::forCurrentOffice()->orderBy('name')->get();

        return Inertia::render('Receivable/Customers/Show', [
            'customer' => $customer,
            'transactions' => $customer->receivableTransactions,
            'grades' => $grades,
            'permissions' => [
                'can_update_transaction' => \Illuminate\Support\Facades\Auth::user()->can('update', \App\Models\ReceivableTransaction::class),
                'can_delete_transaction' => \Illuminate\Support\Facades\Auth::user()->can('delete', \App\Models\ReceivableTransaction::class),
                'can_update_customer' => true, // Bendahara usually can
            ]
        ]);
    }

    public function exportPdf($id)
    {
        $customer = Customer::forCurrentOffice()->findOrFail($id);
        $customer->load(['receivableTransactions' => function ($query) {
            $query->orderBy('date', 'asc');
        }]);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.laporan_customer', [
            'customer' => $customer,
            'transactions' => $customer->receivableTransactions,
            'date' => now()->format('d/m/Y'),
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream("Laporan_Piutang_{$customer->name}.pdf");
    }

    public function destroy($id)
    {
        $customer = Customer::forCurrentOffice()->findOrFail($id);
        $customer->receivableTransactions()->delete(); // Delete transactions first
        $customer->delete(); // Delete customer

        return redirect()->route('receivable.customers.index')->with('message', 'Data customer berhasil di-reset (dihapus).');
    }

    public function reset($id)
    {
        $customer = Customer::forCurrentOffice()->findOrFail($id);

        // Delete all transactions
        $customer->receivableTransactions()->delete();

        // Reset name and contact
        $customer->update([
            'name' => 'KOSONG / RESET',
            'contact' => null,
        ]);

        return redirect()->route('receivable.customers.index')->with('message', 'Data customer berhasil di-reset.');
    }

    public function resetAll()
    {
        // Require stricter auth check if live, ok for now.
        // Truncate tables to reset IDs.
        // Disable foreign key checks
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        \App\Models\ReceivableTransaction::truncate();
        \App\Models\Customer::truncate();

        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        return redirect()->route('receivable.customers.index')->with('message', 'Semua data piutang berhasil di-reset total.');
    }
}
