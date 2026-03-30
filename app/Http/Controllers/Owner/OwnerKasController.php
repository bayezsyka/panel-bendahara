<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\PlantTransaction;
use App\Models\Bendahara\CashSource;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

/**
 * Owner: Laporan Kas
 * Read-only. Filters: cash_type, start_date, end_date.
 */
class OwnerKasController extends Controller
{
    public function index(Request $request)
    {
        $cashType  = $request->input('cash_type', 'kas_besar');
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate   = $request->input('end_date',   Carbon::today()->toDateString());

        // Validate ranges
        $cashType  = in_array($cashType, ['kas_besar', 'kas_kecil']) ? $cashType : 'kas_besar';

        // Open balance (before start_date)
        $inPrev  = PlantTransaction::where('cash_type', $cashType)
            ->where('transaction_date', '<', $startDate)->where('type', 'in')->sum('amount');
        $outPrev = PlantTransaction::where('cash_type', $cashType)
            ->where('transaction_date', '<', $startDate)->where('type', 'out')->sum('amount');
        $openingBalance = (int) ($inPrev - $outPrev);

        // Transactions in range
        $transactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', $cashType)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->orderBy('transaction_date')->orderBy('id')
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'date'           => $t->transaction_date,
                'type'           => $t->type,
                'amount'         => (int) $t->amount,
                'description'    => $t->description ?? '-',
                'source'         => $t->cashSource?->name ?? $t->cashExpenseType?->name ?? '-',
                'reference'      => $t->reference_number ?? null,
            ]);

        $totalIn  = $transactions->where('type', 'in')->sum('amount');
        $totalOut = $transactions->where('type', 'out')->sum('amount');
        $closingBalance = $openingBalance + $totalIn - $totalOut;

        // Running balance for each row
        $running = $openingBalance;
        $rows = $transactions->map(function ($t) use (&$running) {
            $running += ($t['type'] === 'in' ? $t['amount'] : -$t['amount']);
            return array_merge($t, ['running_balance' => $running]);
        });

        // Monthly summary (last 6 months)
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::today()->subMonths($i);
            $mStart = $m->copy()->startOfMonth()->toDateString();
            $mEnd   = $m->copy()->endOfMonth()->toDateString();
            $mIn    = (int) PlantTransaction::where('cash_type', $cashType)->where('type','in')->whereBetween('transaction_date', [$mStart, $mEnd])->sum('amount');
            $mOut   = (int) PlantTransaction::where('cash_type', $cashType)->where('type','out')->whereBetween('transaction_date', [$mStart, $mEnd])->sum('amount');
            $months->push([
                'bulan'     => $m->translatedFormat('M Y'),
                'bulan_key' => $m->format('Y-m'),
                'masuk'     => $mIn,
                'keluar'    => $mOut,
                'selisih'   => $mIn - $mOut,
            ]);
        }

        return Inertia::render('Owner/Kas', [
            'transactions'   => $rows->values(),
            'openingBalance' => $openingBalance,
            'closingBalance' => $closingBalance,
            'totalIn'        => (int) $totalIn,
            'totalOut'       => (int) $totalOut,
            'monthlySummary' => $months->values(),
            'filters' => [
                'cash_type'  => $cashType,
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ],
        ]);
    }
}
