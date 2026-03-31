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
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');
        $projectId = $request->input('project_id');

        // Get customers with their projects, shipments, and payments
        $customers = \App\Models\Delivery\Customer::with(['projects.shipments.concreteGrade', 'projects.payments', 'projects.pumpRentals'])
            ->when($projectId, function ($q) use ($projectId) {
                $q->whereHas('projects', fn($p) => $p->where('id', $projectId));
            })
            ->whereHas('projects', function ($q) {
                $q->has('shipments')->orHas('payments')->orHas('pumpRentals');
            })
            ->get();

        $reports = $customers->map(function ($customer) {
            $ledger = collect();

            foreach ($customer->projects as $project) {
                // Shipments
                $shipments = $project->shipments->map(function ($shipment) use ($project) {
                    return [
                        'type' => 'shipment',
                        'date' => $shipment->date,
                        'original_date' => $shipment->date,
                        'project_name' => $project->name,
                        'docket_number' => $shipment->docket_number,
                        'concrete_grade' => $shipment->concreteGrade ? $shipment->concreteGrade->code : '-',
                        'volume' => (float) $shipment->volume,
                        'price_per_m3' => (float) $shipment->price_per_m3,
                        'debit' => (float) $shipment->total_price_with_tax,
                        'credit' => 0,
                        'description' => $shipment->notes,
                    ];
                });
                $ledger = $ledger->concat($shipments);

                // Pump Rentals
                $pumpRentals = $project->pumpRentals->map(function ($rental) use ($project) {
                    return [
                        'type' => 'pump_rental',
                        'date' => $rental->date,
                        'original_date' => $rental->date,
                        'project_name' => $project->name,
                        'docket_number' => $rental->docket_number ?? '-',
                        'concrete_grade' => 'Sewa Pompa',
                        'volume' => 0,
                        'price_per_m3' => 0,
                        'debit' => (float) ($rental->total_price),
                        'credit' => 0,
                        'description' => $rental->vehicle_number ? "Pompa: " . $rental->vehicle_number : "Sewa Pompa",
                    ];
                });
                $ledger = $ledger->concat($pumpRentals);

                // Payments
                $payments = $project->payments->map(function ($payment) use ($project) {
                    return [
                        'type' => 'payment',
                        'date' => $payment->date,
                        'original_date' => $payment->date,
                        'project_name' => $project->name,
                        'docket_number' => '-',
                        'concrete_grade' => '-',
                        'volume' => 0,
                        'price_per_m3' => 0,
                        'debit' => 0,
                        'credit' => (float) $payment->amount,
                        'description' => $payment->description,
                    ];
                });
                $ledger = $ledger->concat($payments);
            }

            if ($ledger->isEmpty()) return null;

            // Sort by Date
            $ledger = $ledger->sortBy(function ($item) {
                $date = $item['original_date'] instanceof Carbon ? $item['original_date'] : Carbon::parse($item['original_date']);
                return $date->format('Ymd') . ($item['type'] === 'shipment' ? '0' : ($item['type'] === 'pump_rental' ? '1' : '2'));
            });

            // Calculate Running Totals
            $runningBalance = 0; $totalVolume = 0; $totalTagihan = 0; $totalPayment = 0;

            $ledger = $ledger->map(function ($item) use (&$runningBalance, &$totalVolume, &$totalTagihan, &$totalPayment) {
                $runningBalance += $item['debit'] - $item['credit'];
                if ($item['type'] === 'shipment') {
                    $totalVolume += $item['volume'];
                    $totalTagihan += $item['debit'];
                } else if ($item['type'] === 'pump_rental') {
                    $totalTagihan += $item['debit'];
                } else {
                    $totalPayment += $item['credit'];
                }
                $item['balance'] = $runningBalance;
                $item['running_volume'] = $totalVolume;
                $item['running_tagihan'] = $totalTagihan;
                return $item;
            });

            return [
                'customer_name' => $customer->name,
                'ledger' => $ledger,
                'summary' => [
                    'total_volume' => $totalVolume,
                    'total_tagihan' => $totalTagihan,
                    'total_payment' => $totalPayment,
                    'final_balance' => $runningBalance
                ]
            ];
        })->filter();

        if ($reports->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada data piutang.');
        }

        $period = ($startDate && $endDate)
            ? Carbon::parse($startDate)->translatedFormat('d F Y') . ' – ' . Carbon::parse($endDate)->translatedFormat('d F Y')
            : 'Semua Periode';

        $pdf = Pdf::loadView('pdf.receivable.recap', [
            'reports' => $reports,
            'period' => $period,
            'date_printed' => now('Asia/Jakarta')->translatedFormat('d F Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('Laporan-Piutang-Owner.pdf');
    }
}
