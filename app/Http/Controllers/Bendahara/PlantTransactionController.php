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

        // Kas Besar
        $totalInKasBesar = (int) PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'in')->sum('amount');
        $totalOutKasBesar = (int) PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'out')->sum('amount');
        $balanceKasBesar = $totalInKasBesar - $totalOutKasBesar;

        $kasBesarTransactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_besar')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        // Kas Kecil
        $totalInKasKecil = (int) PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'in')->sum('amount');
        $totalOutKasKecil = (int) PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'out')->sum('amount');
        $balanceKasKecil = $totalInKasKecil - $totalOutKasKecil;

        $kasKecilTransactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_kecil')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->limit(10)
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

    public function exportPdf(Request $request)
    {
        $this->ensurePlantContext();
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $type = $request->query('type'); // in, out
        $cashSourceId = $request->query('cash_source_id');
        $cashExpenseTypeId = $request->query('cash_expense_type_id');
        $cashType = $request->query('cash_type'); // kas_besar, kas_kecil

        $query = PlantTransaction::with(['cashSource', 'cashExpenseType']);

        $initialBalance = 0;
        $periodText = 'Semua Periode';
        $reportTitle = 'Laporan Kas Plant';

        // Apply cash_type filter
        if ($cashType) {
            $query->where('cash_type', $cashType);
            $reportTitle = $cashType === 'kas_besar' ? 'Laporan Kas Besar' : 'Laporan Kas Kecil';
        } else {
            $reportTitle = 'Laporan Kas Plant (Semua)';
        }

        if ($startDate) {
            $periodText = "Periode: " . Carbon::parse($startDate)->translatedFormat('d F Y');

            // Calculate balance before start date with same filters
            $prevQuery = PlantTransaction::where('transaction_date', '<', $startDate);

            if ($cashType) $prevQuery->where('cash_type', $cashType);
            if ($type) $prevQuery->where('type', $type);
            if ($cashSourceId) $prevQuery->where('cash_source_id', $cashSourceId);
            if ($cashExpenseTypeId) $prevQuery->where('cash_expense_type_id', $cashExpenseTypeId);

            $prevIn = (clone $prevQuery)->where('type', 'in')->sum('amount');
            $prevOut = (clone $prevQuery)->where('type', 'out')->sum('amount');
            $initialBalance = $prevIn - $prevOut;

            $query->where('transaction_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('transaction_date', '<=', $endDate);
            if ($startDate) {
                $periodText .= " s/d " . Carbon::parse($endDate)->translatedFormat('d F Y');
            } else {
                $periodText = "Sampai dengan " . Carbon::parse($endDate)->translatedFormat('d F Y');
            }
        }

        // Apply filters
        if ($type) {
            $query->where('type', $type);
            $periodText .= ($type == 'in' ? ' (Hanya Kas Masuk)' : ' (Hanya Kas Keluar)');
        }
        if ($cashSourceId) {
            $query->where('cash_source_id', $cashSourceId);
            $cs = CashSource::find($cashSourceId);
            if ($cs) $periodText .= ' - Sumber: ' . $cs->name;
        }
        if ($cashExpenseTypeId) {
            $query->where('cash_expense_type_id', $cashExpenseTypeId);
            $cet = CashExpenseType::find($cashExpenseTypeId);
            if ($cet) $periodText .= ' - Tipe: ' . $cet->name;
        }

        $transactions = $query->orderBy('transaction_date', 'asc')->orderBy('id', 'asc')->get();

        $pdf = Pdf::loadView('pdf.plant.laporan_keuangan', [
            'transactions' => $transactions,
            'initialBalance' => $initialBalance,
            'periodText' => $periodText,
            'reportTitle' => $reportTitle
        ]);

        return $pdf->stream('Laporan-Plant.pdf');
    }

    /**
     * Halaman Kas Besar - menampilkan semua transaksi dengan cash_type = kas_besar
     */
    public function kasBesar(Request $request)
    {
        $this->ensurePlantContext();

        $query = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_besar')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        // Filter berdasarkan tipe (in/out) jika ada
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan cash_source_id jika ada
        if ($request->filled('cash_source_id')) {
            $query->where('cash_source_id', $request->cash_source_id);
        }

        // Filter berdasarkan cash_expense_type_id jika ada
        if ($request->filled('cash_expense_type_id')) {
            $query->where('cash_expense_type_id', $request->cash_expense_type_id);
        }

        $transactions = $query->get();
        $cashSources = CashSource::orderBy('name')->get();
        $cashExpenseTypes = CashExpenseType::orderBy('name')->get();

        // Hitung total masuk dan keluar
        $totalIn = PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'in')->sum('amount');
        $totalOut = PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'out')->sum('amount');
        $balance = $totalIn - $totalOut;

        return Inertia::render('Cash/KasBesar', [
            'transactions' => $transactions,
            'cashSources' => $cashSources,
            'cashExpenseTypes' => $cashExpenseTypes,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'balance' => $balance,
            'filters' => [
                'type' => $request->type,
                'cash_source_id' => $request->cash_source_id,
                'cash_expense_type_id' => $request->cash_expense_type_id,
            ]
        ]);
    }

    /**
     * Halaman Kas Kecil - menampilkan semua transaksi dengan cash_type = kas_kecil
     */
    public function kasKecil(Request $request)
    {
        $this->ensurePlantContext();

        $query = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', 'kas_kecil')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        // Filter berdasarkan tipe (in/out) jika ada
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan cash_expense_type_id jika ada
        if ($request->filled('cash_expense_type_id')) {
            $query->where('cash_expense_type_id', $request->cash_expense_type_id);
        }

        $transactions = $query->get();
        $cashSources = CashSource::orderBy('name')->get();
        $cashExpenseTypes = CashExpenseType::orderBy('name')->get();

        // Hitung total masuk dan keluar
        $totalIn = PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'in')->sum('amount');
        $totalOut = PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'out')->sum('amount');
        $balance = $totalIn - $totalOut;

        return Inertia::render('Cash/KasKecil', [
            'transactions' => $transactions,
            'cashSources' => $cashSources,
            'cashExpenseTypes' => $cashExpenseTypes,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'balance' => $balance,
            'filters' => [
                'type' => $request->type,
                'cash_expense_type_id' => $request->cash_expense_type_id,
            ]
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
}
