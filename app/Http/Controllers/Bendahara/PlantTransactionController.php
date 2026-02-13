<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PlantTransaction;
use App\Models\CashSource;
use App\Models\CashExpenseType;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class PlantTransactionController extends Controller
{
    /**
     * Dashboard Kas (Pengganti Dashboard Plant di ProjectExpense)
     */
    public function dashboard(Request $request)
    {
        $this->ensurePlantContext();

        // Kas Besar Summary
        $totalInKasBesar = (int) PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'in')->sum('amount');
        $totalOutKasBesar = (int) PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'out')->sum('amount');
        $balanceKasBesar = $totalInKasBesar - $totalOutKasBesar;

        $kasBesarTransactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_besar')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        // Kas Kecil Summary
        $totalInKasKecil = (int) PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'in')->sum('amount');
        $totalOutKasKecil = (int) PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'out')->sum('amount');
        $balanceKasKecil = $totalInKasKecil - $totalOutKasKecil;

        $kasKecilTransactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_kecil')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        return Inertia::render('Cash/Dashboard', [
            'totalInKasBesar' => $totalInKasBesar,
            'totalOutKasBesar' => $totalOutKasBesar,
            'balanceKasBesar' => $balanceKasBesar,
            'kasBesarTransactions' => $kasBesarTransactions,
            'totalInKasKecil' => $totalInKasKecil,
            'totalOutKasKecil' => $totalOutKasKecil,
            'balanceKasKecil' => $balanceKasKecil,
            'kasKecilTransactions' => $kasKecilTransactions,
        ]);
    }


    /**
     * Halaman Kas Besar - menampilkan semua transaksi dengan cash_type = kas_besar
     */
    public function kasBesar(Request $request)
    {
        $this->ensurePlantContext();

        $date = $request->query('date', Carbon::today()->toDateString());
        $carbonDate = Carbon::parse($date);

        $prevDate = $carbonDate->copy()->subDay()->toDateString();
        $nextDate = $carbonDate->copy()->addDay()->toDateString();

        // 1. Opening Balance (Sisa Saldo Kemarin)
        $inPrev = PlantTransaction::where('cash_type', 'kas_besar')
            ->where('transaction_date', '<', $date)
            ->where('type', 'in')
            ->sum('amount');
        $outPrev = PlantTransaction::where('cash_type', 'kas_besar')
            ->where('transaction_date', '<', $date)
            ->where('type', 'out')
            ->sum('amount');
        $saldoAwal = $inPrev - $outPrev;

        // 2. Daily Transactions
        $dailyTransactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_besar')
            ->whereDate('transaction_date', $date)
            ->orderBy('id', 'asc') // Urutkan sesuai input/ID
            ->get();

        $incomes = $dailyTransactions->where('type', 'in')->values();
        $expenses = $dailyTransactions->where('type', 'out')->values();

        // Master Data for Selects
        $cashSources = CashSource::orderBy('name')->get();
        $cashExpenseTypes = CashExpenseType::orderBy('name')->get();

        // Global Totals for Header Card
        $totalIn = PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'in')->sum('amount');
        $totalOut = PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'out')->sum('amount');
        $balance = $totalIn - $totalOut;

        return Inertia::render('Cash/KasBesar', [
            'selectedDate' => $date,
            'prevDate' => $prevDate,
            'nextDate' => $nextDate,
            'saldoAwal' => $saldoAwal,
            'incomes' => $incomes,
            'expenses' => $expenses,
            'cashSources' => $cashSources,
            'cashExpenseTypes' => $cashExpenseTypes,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'balance' => $balance,
        ]);
    }

    /**
     * Halaman Kas Kecil - menampilkan semua transaksi dengan cash_type = kas_kecil
     */
    public function kasKecil(Request $request)
    {
        $this->ensurePlantContext();

        $date = $request->query('date', Carbon::today()->toDateString());
        $carbonDate = Carbon::parse($date);

        $prevDate = $carbonDate->copy()->subDay()->toDateString();
        $nextDate = $carbonDate->copy()->addDay()->toDateString();

        // 1. Opening Balance (Sisa Saldo Kemarin)
        $inPrev = PlantTransaction::where('cash_type', 'kas_kecil')
            ->where('transaction_date', '<', $date)
            ->where('type', 'in')
            ->sum('amount');
        $outPrev = PlantTransaction::where('cash_type', 'kas_kecil')
            ->where('transaction_date', '<', $date)
            ->where('type', 'out')
            ->sum('amount');
        $saldoAwal = $inPrev - $outPrev;

        // 2. Daily Transactions
        $dailyTransactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_kecil')
            ->whereDate('transaction_date', $date)
            ->orderBy('id', 'asc')
            ->get();

        $incomes = $dailyTransactions->where('type', 'in')->values();
        $expenses = $dailyTransactions->where('type', 'out')->values();

        // Master Data for Selects
        $cashSources = CashSource::orderBy('name')->get();
        $cashExpenseTypes = CashExpenseType::orderBy('name')->get();

        // Global Totals for Header Card
        $totalIn = PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'in')->sum('amount');
        $totalOut = PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'out')->sum('amount');
        $balance = $totalIn - $totalOut;

        return Inertia::render('Cash/KasKecil', [
            'selectedDate' => $date,
            'prevDate' => $prevDate,
            'nextDate' => $nextDate,
            'saldoAwal' => $saldoAwal,
            'incomes' => $incomes,
            'expenses' => $expenses,
            'cashSources' => $cashSources,
            'cashExpenseTypes' => $cashExpenseTypes,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'balance' => $balance,
        ]);
    }

    private function ensurePlantContext()
    {
        if (!Auth::user()->canAccessPanel(\App\Models\User::PANEL_CASH)) {
            abort(403, 'Anda tidak memiliki akses ke panel ini.');
        }
    }

    public function store(Request $request)
    {
        $this->ensurePlantContext();
        if (!Auth::user()->canManage(\App\Models\User::PANEL_CASH)) {
            abort(403, 'Anda tidak memiliki izin mengubah data ini.');
        }

        $request->validate([
            'transaction_date' => 'required|date',
            'type' => 'required|in:in,out',
            'cash_type' => 'required|in:kas_besar,kas_kecil',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
            'cash_source_id' => 'required_if:type,in|nullable|exists:cash_sources,id',
            'cash_expense_type_id' => 'required_if:type,out|nullable|exists:cash_expense_types,id',
        ]);

        // Prevent manual income for Kas Kecil
        if ($request->cash_type === 'kas_kecil' && $request->type === 'in') {
            return redirect()->back()->withErrors(['type' => 'Pemasukan Kas Kecil hanya diperbolehkan melalui transfer dari Kas Besar.']);
        }

        PlantTransaction::create([
            'transaction_date' => $request->transaction_date,
            'type' => $request->type,
            'cash_type' => $request->cash_type,
            'amount' => $request->amount,
            'description' => $request->description,
            'cash_source_id' => $request->type === 'in' ? $request->cash_source_id : null,
            'cash_expense_type_id' => $request->type === 'out' ? $request->cash_expense_type_id : null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('message', 'Transaksi berhasil disimpan');
    }

    public function transfer(Request $request)
    {
        $this->ensurePlantContext();
        if (!Auth::user()->canManage(\App\Models\User::PANEL_CASH)) {
            abort(403, 'Anda tidak memiliki izin mengubah data ini.');
        }

        $request->validate([
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        // Wrap in transaction to ensure atomicity
        \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            // 1. Catat Pengeluaran di Kas Besar
            PlantTransaction::create([
                'transaction_date' => $request->transaction_date,
                'type' => 'out',
                'cash_type' => 'kas_besar',
                'amount' => $request->amount,
                'description' => 'Transfer ke Kas Kecil: ' . $request->description,
                'created_by' => Auth::id(),
            ]);

            // 2. Catat Pemasukan di Kas Kecil
            PlantTransaction::create([
                'transaction_date' => $request->transaction_date,
                'type' => 'in',
                'cash_type' => 'kas_kecil',
                'amount' => $request->amount,
                'description' => 'Terima dari Kas Besar: ' . $request->description,
                'created_by' => Auth::id(),
            ]);
        });

        return redirect()->back()->with('message', 'Transfer ke Kas Kecil berhasil!');
    }

    public function update(Request $request, PlantTransaction $plantTransaction)
    {
        $this->ensurePlantContext();
        if (!Auth::user()->canManage(\App\Models\User::PANEL_CASH)) {
            abort(403, 'Anda tidak memiliki izin mengubah data ini.');
        }

        $request->validate([
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
            'cash_source_id' => 'required_if:type,in|nullable|exists:cash_sources,id',
            'cash_expense_type_id' => 'required_if:type,out|nullable|exists:cash_expense_types,id',
        ]);

        $plantTransaction->update([
            'transaction_date' => $request->transaction_date,
            'amount' => $request->amount,
            'description' => $request->description,
            'cash_source_id' => $plantTransaction->type === 'in' ? $request->cash_source_id : null,
            'cash_expense_type_id' => $plantTransaction->type === 'out' ? $request->cash_expense_type_id : null,
        ]);

        return redirect()->back()->with('message', 'Transaksi berhasil diperbarui');
    }

    public function destroy(PlantTransaction $plantTransaction)
    {
        $this->ensurePlantContext();
        if (!Auth::user()->canManage(\App\Models\User::PANEL_CASH)) {
            abort(403, 'Anda tidak memiliki izin mengubah data ini.');
        }

        $plantTransaction->delete();
        return redirect()->back()->with('message', 'Transaksi berhasil dihapus');
    }
    public function exportPdf(Request $request)
    {
        $this->ensurePlantContext();

        $cashType = $request->input('cash_type', 'kas_besar');
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        // 1. Opening Balance (Before Start Date)
        $inPrev = PlantTransaction::where('cash_type', $cashType)
            ->where('transaction_date', '<', $startDate)
            ->where('type', 'in')
            ->sum('amount');
        $outPrev = PlantTransaction::where('cash_type', $cashType)
            ->where('transaction_date', '<', $startDate)
            ->where('type', 'out')
            ->sum('amount');
        $initialBalance = $inPrev - $outPrev;

        // 2. Transactions in Range
        $transactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', $cashType)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $incomes = $transactions->where('type', 'in');
        $expenses = $transactions->where('type', 'out');

        $totalInRaw = $incomes->sum('amount');
        $totalOutRaw = $expenses->sum('amount');

        // Calculate Total Income for Display (Initial Balance + Incomes)
        $totalIncomeDisplay = $initialBalance + $totalInRaw;

        // Final Balance
        $finalBalance = $totalIncomeDisplay - $totalOutRaw;

        $title = $cashType === 'kas_besar' ? 'Laporan Kas Besar' : 'Laporan Kas Kecil';

        $initialDate = Carbon::parse($startDate);
        $finalDate = Carbon::parse($endDate);

        if ($initialDate->equalTo($finalDate)) {
            $periodText = 'Tanggal: ' . $initialDate->translatedFormat('d F Y');
        } else {
            $periodText = 'Periode: ' . $initialDate->translatedFormat('d F Y') . ' s/d ' . $finalDate->translatedFormat('d F Y');
        }

        $pdf = Pdf::loadView('pdf.plant.daily_report', [
            'title' => $title,
            'periodText' => $periodText,
            'initialBalance' => $initialBalance,
            'incomes' => $incomes,
            'expenses' => $expenses,
            'totalInRaw' => $totalInRaw,
            'totalIncomeDisplay' => $totalIncomeDisplay,
            'totalOutRaw' => $totalOutRaw,
            'finalBalance' => $finalBalance,
            'cashType' => $cashType,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('laporan_' . $cashType . '_' . $startDate . '.pdf');
    }
}
