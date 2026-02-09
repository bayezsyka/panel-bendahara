<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PlantTransaction;
use App\Models\ExpenseType;
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

        $expenseTypes = ExpenseType::where('office_id', 2)->orderBy('name')->get();

        // Kas Besar
        $totalInKasBesar = (int) PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'in')->sum('amount');
        $totalOutKasBesar = (int) PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'out')->sum('amount');
        $balanceKasBesar = $totalInKasBesar - $totalOutKasBesar;

        // Kas Kecil
        $totalInKasKecil = (int) PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'in')->sum('amount');
        $totalOutKasKecil = (int) PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'out')->sum('amount');
        $balanceKasKecil = $totalInKasKecil - $totalOutKasKecil;

        return Inertia::render('Bendahara/Plant/Dashboard', [
            'expenseTypes' => $expenseTypes,
            'totalInKasBesar' => $totalInKasBesar,
            'totalOutKasBesar' => $totalOutKasBesar,
            'balanceKasBesar' => $balanceKasBesar,
            'totalInKasKecil' => $totalInKasKecil,
            'totalOutKasKecil' => $totalOutKasKecil,
            'balanceKasKecil' => $balanceKasKecil,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $this->ensurePlantContext();
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $type = $request->query('type'); // in, out
        $expenseTypeId = $request->query('expense_type_id');
        $cashType = $request->query('cash_type'); // kas_besar, kas_kecil

        $query = PlantTransaction::with('expenseType');

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
            if ($expenseTypeId) $prevQuery->where('expense_type_id', $expenseTypeId);

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
        if ($expenseTypeId) {
            $query->where('expense_type_id', $expenseTypeId);
            $et = ExpenseType::find($expenseTypeId);
            if ($et) $periodText .= ' - Tipe: ' . $et->name;
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

        $query = PlantTransaction::with('expenseType')
            ->where('cash_type', 'kas_besar')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        // Filter berdasarkan tipe (in/out) jika ada
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan expense_type_id jika ada
        if ($request->filled('expense_type_id')) {
            $query->where('expense_type_id', $request->expense_type_id);
        }

        $transactions = $query->get();
        $expenseTypes = ExpenseType::orderBy('name')->get();

        // Hitung total masuk dan keluar
        $totalIn = PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'in')->sum('amount');
        $totalOut = PlantTransaction::where('cash_type', 'kas_besar')->where('type', 'out')->sum('amount');
        $balance = $totalIn - $totalOut;

        return Inertia::render('Bendahara/Plant/KasBesar', [
            'transactions' => $transactions,
            'expenseTypes' => $expenseTypes,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'balance' => $balance,
            'filters' => [
                'type' => $request->type,
                'expense_type_id' => $request->expense_type_id,
            ]
        ]);
    }

    /**
     * Halaman Kas Kecil - menampilkan semua transaksi dengan cash_type = kas_kecil
     */
    public function kasKecil(Request $request)
    {
        $this->ensurePlantContext();

        $query = PlantTransaction::with('expenseType')
            ->where('cash_type', 'kas_kecil')
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        // Filter berdasarkan tipe (in/out) jika ada
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan expense_type_id jika ada
        if ($request->filled('expense_type_id')) {
            $query->where('expense_type_id', $request->expense_type_id);
        }

        $transactions = $query->get();
        $expenseTypes = ExpenseType::orderBy('name')->get();

        // Hitung total masuk dan keluar
        $totalIn = PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'in')->sum('amount');
        $totalOut = PlantTransaction::where('cash_type', 'kas_kecil')->where('type', 'out')->sum('amount');
        $balance = $totalIn - $totalOut;

        return Inertia::render('Bendahara/Plant/KasKecil', [
            'transactions' => $transactions,
            'expenseTypes' => $expenseTypes,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'balance' => $balance,
            'filters' => [
                'type' => $request->type,
                'expense_type_id' => $request->expense_type_id,
            ]
        ]);
    }

    private function ensurePlantContext()
    {
        // Removed strict office context check as per user request to decouple panels from office context
        // if (app(\App\Services\OfficeContextService::class)->getCurrentOfficeId() !== 2) {
        //    abort(403, 'Akses ditolak. Anda berada di konteks Kantor Utama.');
        // }

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
            'expense_type_id' => 'required|exists:expense_types,id',
        ]);

        PlantTransaction::create([
            'transaction_date' => $request->transaction_date,
            'type' => $request->type,
            'cash_type' => $request->cash_type,
            'amount' => $request->amount,
            'description' => $request->description,
            'expense_type_id' => $request->expense_type_id,
            'expense_category' => $request->type === 'in' ? 'Sumber Dana' : 'Tipe Biaya',
            'created_by' => Auth::id(),
            'office_id' => 2, // Explicitly set office ID
        ]);

        return redirect()->back()->with('message', 'Transaksi berhasil disimpan');
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
            'expense_type_id' => 'required|exists:expense_types,id',
        ]);

        $plantTransaction->update([
            'transaction_date' => $request->transaction_date,
            'amount' => $request->amount,
            'description' => $request->description,
            'expense_type_id' => $request->expense_type_id,
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
