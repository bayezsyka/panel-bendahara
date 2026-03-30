<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Expense;
use App\Models\ExpenseType;
use App\Models\PlantTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * OwnerReportController
 *
 * Thin wrapper that re-executes the same PDF generation logic as the
 * Bendahara/ProjectExpense controllers, but sits under the owner route
 * group (auth + role:owner) so no bendahara panel-access middleware blocks it.
 *
 * STRICT READ-ONLY: Only GET routes. No data mutations.
 */
class OwnerReportController extends Controller
{
    // ── 1. Laporan Rekapitulasi Keseluruhan Proyek ──────────────────────────
    public function laporanKeseluruhan(Request $request)
    {
        ini_set('memory_limit', '512M');

        $projects = Project::query()
            ->select('id', 'name', 'status')
            ->with(['expenses' => fn($q) => $q
                ->select('id', 'project_id', 'amount', 'transacted_at', 'title')
                ->orderBy('transacted_at', 'asc'),
                'mandors:id,name',
            ])
            ->cursor();

        $pdf = Pdf::loadView('pdf.laporan.rekapitulasi_keseluruhan', [
            'projects'    => $projects,
            'withReceipts'=> false,
            'generatedAt' => now('Asia/Jakarta')->translatedFormat('d F Y H:i'),
        ]);

        return $pdf->stream('Laporan-Keseluruhan-Proyek.pdf');
    }

    // ── 2. Laporan Kas (Kas Besar dan Kas Kecil) ────────────────────────────
    public function laporanKas(Request $request)
    {
        $cashType  = $request->input('cash_type', 'kas_besar');
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate   = $request->input('end_date', Carbon::today()->toDateString());

        // Opening Balance
        $inPrev  = PlantTransaction::where('cash_type', $cashType)
            ->where('transaction_date', '<', $startDate)->where('type', 'in')->sum('amount');
        $outPrev = PlantTransaction::where('cash_type', $cashType)
            ->where('transaction_date', '<', $startDate)->where('type', 'out')->sum('amount');
        $initialBalance = $inPrev - $outPrev;

        // Transactions in range
        $transactions = PlantTransaction::with(['cashSource', 'cashExpenseType'])
            ->where('cash_type', $cashType)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->orderBy('transaction_date')->orderBy('id')
            ->get();

        $incomes  = $transactions->where('type', 'in');
        $expenses = $transactions->where('type', 'out');

        $totalInRaw         = $incomes->sum('amount');
        $totalOutRaw        = $expenses->sum('amount');
        $totalIncomeDisplay = $initialBalance + $totalInRaw;
        $finalBalance       = $totalIncomeDisplay - $totalOutRaw;

        $title = $cashType === 'kas_besar' ? 'Laporan Kas Besar' : 'Laporan Kas Kecil';

        $initialDate = Carbon::parse($startDate);
        $finalDate   = Carbon::parse($endDate);
        $periodText  = $initialDate->equalTo($finalDate)
            ? 'Tanggal: ' . $initialDate->translatedFormat('d F Y')
            : 'Periode: ' . $initialDate->translatedFormat('d F Y') . ' s/d ' . $finalDate->translatedFormat('d F Y');

        $mpdf = new \Mpdf\Mpdf([
            'format' => 'A4', 'orientation' => 'P',
            'margin_left' => 15, 'margin_right' => 15,
            'margin_top'  => 10, 'margin_bottom' => 15,
        ]);

        $html = view('pdf.plant.daily_report_mpdf', compact(
            'title', 'periodText', 'initialBalance', 'incomes', 'expenses',
            'totalInRaw', 'totalIncomeDisplay', 'totalOutRaw', 'finalBalance', 'cashType'
        ))->render();

        $mpdf->WriteHTML($html);
        $filename = 'laporan_' . $cashType . '_' . $startDate . '.pdf';

        return response($mpdf->Output($filename, 'S'), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    // ── 3. Laporan Piutang / Riwayat Penerimaan ─────────────────────────────
    public function laporanPiutang(Request $request)
    {
        // Re-uses the same view as ReceivableController::exportPdf
        // Pull the same data without going through the bendahara middleware.
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        $query = \App\Models\ReceivableTransaction::with(['deliveryProject.customer'])
            ->where('type', 'payment')
            ->orderBy('created_at', 'desc');

        if ($startDate) $query->whereDate('created_at', '>=', $startDate);
        if ($endDate)   $query->whereDate('created_at', '<=', $endDate);

        $payments    = $query->get();
        $grandTotal  = $payments->sum('amount');

        $period = ($startDate && $endDate)
            ? Carbon::parse($startDate)->translatedFormat('d F Y') . ' – ' . Carbon::parse($endDate)->translatedFormat('d F Y')
            : 'Semua Waktu';

        $pdf = Pdf::loadView('pdf.laporan.riwayat_piutang', [
            'payments'    => $payments,
            'grandTotal'  => $grandTotal,
            'period'      => $period,
            'generatedAt' => now('Asia/Jakarta')->translatedFormat('d F Y H:i'),
        ]);

        return $pdf->stream('Laporan-Riwayat-Pembayaran.pdf');
    }
}
