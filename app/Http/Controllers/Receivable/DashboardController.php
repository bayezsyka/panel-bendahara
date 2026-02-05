<?php

namespace App\Http\Controllers\Receivable;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\ReceivableTransaction;
use App\Models\Customer;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class DashboardController extends Controller
{
    public function index()
    {
        // Analytic Stats
        $customers = Customer::forCurrentOffice()->withSum('receivableTransactions', 'bill_amount')
            ->withSum('receivableTransactions', 'payment_amount')
            ->withSum('receivableTransactions', 'volume')
            ->get();

        $totalOutstanding = $customers->sum(function ($customer) {
            $bal = ($customer->receivable_transactions_sum_bill_amount ?? 0) - ($customer->receivable_transactions_sum_payment_amount ?? 0);
            return $bal > 0 ? $bal : 0;
        });

        $totalVolume = $customers->sum('receivable_transactions_sum_volume');
        $customerCount = $customers->count();
        $customerUnpaid = $customers->filter(
            fn($c) => (($c->receivable_transactions_sum_bill_amount ?? 0) - ($c->receivable_transactions_sum_payment_amount ?? 0)) > 0
        )->count();

        // Get monthly bill vs payment stats (Current Year)
        $monthlyStats = ReceivableTransaction::forCurrentOffice()
            ->selectRaw('MONTH(date) as month, SUM(bill_amount) as total_bill, SUM(payment_amount) as total_payment')
            ->whereYear('date', Carbon::now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('Receivable/Dashboard', [
            'totalOutstanding' => $totalOutstanding,
            'totalVolume' => $totalVolume,
            'customerCount' => $customerCount,
            'customerUnpaid' => $customerUnpaid,
            'monthlyStats' => $monthlyStats
        ]);
    }

    public function exportPdf()
    {
        $customers = Customer::forCurrentOffice()
            ->withSum('receivableTransactions', 'bill_amount')
            ->withSum('receivableTransactions', 'payment_amount')
            ->orderBy('id')
            ->get();

        $pdf = Pdf::loadView('receivable.dashboard-pdf', compact('customers'));
        return $pdf->stream('laporan-piutang.pdf');
    }
}
