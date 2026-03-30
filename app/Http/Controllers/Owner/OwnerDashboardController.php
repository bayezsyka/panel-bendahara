<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\PlantTransaction;
use App\Models\ReceivableTransaction;
use App\Models\Expense;
use App\Models\Delivery\DeliveryProject;
use App\Models\Delivery\DeliveryShipment;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OwnerDashboardController extends Controller
{
    /**
     * Owner Dashboard – High-Level Command Center.
     *
     * All data is strictly read-only. No mutations are performed here.
     * Query results are cached for 5 minutes to reduce DB load,
     * while staying reasonably up-to-date for an executive view.
     */
    public function index()
    {
        $metrics = Cache::remember('owner.dashboard.metrics', now()->addMinutes(5), function () {

            // ─────────────────────────────────────────────────────────────
            // 1. TOTAL KAS KESELURUHAN (Kas Besar + Kas Kecil)
            // ─────────────────────────────────────────────────────────────
            $kasStats = PlantTransaction::select(
                    'cash_type',
                    'type',
                    DB::raw('SUM(amount) as total')
                )
                ->groupBy('cash_type', 'type')
                ->get()
                ->groupBy('cash_type');

            $kasBesarIn  = (int) ($kasStats->get('kas_besar')?->firstWhere('type', 'in')?->total ?? 0);
            $kasBesarOut = (int) ($kasStats->get('kas_besar')?->firstWhere('type', 'out')?->total ?? 0);
            $kasKecilIn  = (int) ($kasStats->get('kas_kecil')?->firstWhere('type', 'in')?->total ?? 0);
            $kasKecilOut = (int) ($kasStats->get('kas_kecil')?->firstWhere('type', 'out')?->total ?? 0);

            $balanceKasBesar = $kasBesarIn - $kasBesarOut;
            $balanceKasKecil = $kasKecilIn  - $kasKecilOut;
            $totalKas        = $balanceKasBesar + $balanceKasKecil;

            // ─────────────────────────────────────────────────────────────
            // 2. TOTAL PIUTANG BELUM LUNAS
            //
            // Logic: per DeliveryProject, piutang = total tagihan shipment
            // (dengan PPN jika berlaku) + pump rentals – total pembayaran masuk.
            // Proyek dengan sisa > 0 = belum lunas.
            //
            // Efficient: single query aggregation per project via subqueries.
            // ─────────────────────────────────────────────────────────────

            // Total tagihan (total_price_with_tax sudah menyertakan PPN di dalam model)
            $totalTagihanShipments = DeliveryShipment::select(
                    'delivery_project_id',
                    DB::raw('SUM(total_price_with_tax) as total_tagihan')
                )
                ->whereNull('deleted_at')
                ->groupBy('delivery_project_id')
                ->pluck('total_tagihan', 'delivery_project_id')
                ->map(fn($v) => (float) $v);

            // Total pump rental (sudah termasuk tax di kolom)
            $totalTagihanPump = DB::table('delivery_pump_rentals')
                ->select(
                    'delivery_project_id',
                    DB::raw('SUM(total_price) as total_pump')
                )
                ->whereNull('deleted_at')
                ->groupBy('delivery_project_id')
                ->pluck('total_pump', 'delivery_project_id')
                ->map(fn($v) => (float) $v);

            // Total pembayaran masuk per proyek
            $totalPayments = ReceivableTransaction::select(
                    'delivery_project_id',
                    DB::raw('SUM(amount) as total_bayar')
                )
                ->where('type', 'payment')
                ->groupBy('delivery_project_id')
                ->pluck('total_bayar', 'delivery_project_id')
                ->map(fn($v) => (float) $v);

            // Hitung pump tax dari projects yang has_ppn
            $projectsPpn = DeliveryProject::whereNull('deleted_at')
                ->pluck('has_ppn', 'id');

            $totalPiutangBelumLunas = 0.0;
            $jumlahProyekBelumLunas = 0;

            $allProjectIds = $totalTagihanShipments->keys()
                ->merge($totalTagihanPump->keys())
                ->unique();

            foreach ($allProjectIds as $projectId) {
                $tagihan    = $totalTagihanShipments->get($projectId, 0);
                $pumpRaw    = $totalTagihanPump->get($projectId, 0);
                $hasPpn     = $projectsPpn->get($projectId, false);
                $pumpTotal  = $pumpRaw + ($hasPpn ? $pumpRaw * 0.11 : 0);
                $bayar      = $totalPayments->get($projectId, 0);
                $sisa       = ($tagihan + $pumpTotal) - $bayar;

                if ($sisa > 0) {
                    $totalPiutangBelumLunas += $sisa;
                    $jumlahProyekBelumLunas++;
                }
            }

            // ─────────────────────────────────────────────────────────────
            // 3. TOTAL PENGELUARAN PROYEK BULAN INI
            // ─────────────────────────────────────────────────────────────
            $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
            $endOfMonth   = Carbon::now()->endOfMonth()->toDateString();

            $pengeluaranBulanIni = (int) Expense::whereBetween('transacted_at', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $jumlahExpenseBulanIni = Expense::whereBetween('transacted_at', [$startOfMonth, $endOfMonth])
                ->count();

            // ─────────────────────────────────────────────────────────────
            // 4. SNAPSHOT TAMBAHAN (Konteks Eksekutif)
            // ─────────────────────────────────────────────────────────────

            // Total proyek konstruksi aktif (belum soft-deleted)
            $totalProyekAktif = Project::whereNull('deleted_at')->count();

            // Total pengiriman bulan ini
            $totalPengirimanBulanIni = DeliveryShipment::whereNull('deleted_at')
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->count();

            // Volume beton terkirim bulan ini (m³)
            $volumeBetonBulanIni = (float) DeliveryShipment::whereNull('deleted_at')
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->sum('volume');

            // Pengeluaran kas bulan ini (dari PlantTransaction)
            $pengeluaranKasBulanIni = (int) PlantTransaction::where('type', 'out')
                ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            return [
                // --- Kartu Utama ---
                'total_kas' => [
                    'total'           => $totalKas,
                    'kas_besar'       => $balanceKasBesar,
                    'kas_kecil'       => $balanceKasKecil,
                ],
                'piutang_belum_lunas' => [
                    'total'           => round($totalPiutangBelumLunas),
                    'jumlah_proyek'   => $jumlahProyekBelumLunas,
                ],
                'pengeluaran_proyek_bulan_ini' => [
                    'total'           => $pengeluaranBulanIni,
                    'jumlah_transaksi' => $jumlahExpenseBulanIni,
                    'periode'         => Carbon::now()->translatedFormat('F Y'),
                ],
                // --- Snapshot Operasional ---
                'snapshot' => [
                    'total_proyek_aktif'         => $totalProyekAktif,
                    'pengiriman_bulan_ini'        => $totalPengirimanBulanIni,
                    'volume_beton_bulan_ini_m3'   => round($volumeBetonBulanIni, 2),
                    'pengeluaran_kas_bulan_ini'   => $pengeluaranKasBulanIni,
                ],
                // --- Meta ---
                'generated_at' => Carbon::now()->toIso8601String(),
                'periode_bulan' => [
                    'start' => $startOfMonth,
                    'end'   => $endOfMonth,
                ],
            ];
        });

        // ─────────────────────────────────────────────────────────────────
        // ANALYTICS 1 — PROJECT SPENDING (Top 5 proyek berdasarkan belanja)
        // Karena tidak ada kolom "nilai_kontrak", kita tampilkan sebagai
        // "Total Pengeluaran per Proyek" — data nyata & akurat.
        // ─────────────────────────────────────────────────────────────────
        $projectSpending = Cache::remember('owner.dashboard.project_spending', now()->addMinutes(10), function () {
            return Project::withSum('expenses', 'amount')
                ->whereNull('deleted_at')
                ->orderByDesc('expenses_sum_amount')
                ->limit(5)
                ->get()
                ->map(fn($p) => [
                    'id'              => $p->id,
                    'name'            => $p->name,
                    'status'          => $p->status,
                    'total_pengeluaran' => (int) ($p->expenses_sum_amount ?? 0),
                ])
                ->values()
                ->toArray();
        });

        // ─────────────────────────────────────────────────────────────────
        // ANALYTICS 2 — CASHFLOW TREND (6 bulan terakhir, per bulan)
        // Mengambil arus kas dari PlantTransaction (kas besar + kecil).
        // ─────────────────────────────────────────────────────────────────
        $cashflowTrend = Cache::remember('owner.dashboard.cashflow_trend', now()->addMinutes(10), function () {
            $months = collect();
            for ($i = 5; $i >= 0; $i--) {
                $months->push(Carbon::now()->subMonths($i)->startOfMonth());
            }

            // Aggregate kas masuk & keluar per bulan dalam satu query
            $rawTrend = PlantTransaction::select(
                    DB::raw("DATE_FORMAT(transaction_date, '%Y-%m') as bulan"),
                    'type',
                    DB::raw('SUM(amount) as total')
                )
                ->where('transaction_date', '>=', $months->first()->toDateString())
                ->groupBy('bulan', 'type')
                ->orderBy('bulan')
                ->get()
                ->groupBy('bulan');

            return $months->map(function (Carbon $month) use ($rawTrend) {
                $key  = $month->format('Y-m');
                $data = $rawTrend->get($key, collect());
                return [
                    'bulan'     => $month->translatedFormat('M Y'),
                    'bulan_key' => $key,
                    'kas_masuk' => (int) ($data->firstWhere('type', 'in')?->total ?? 0),
                    'kas_keluar'=> (int) ($data->firstWhere('type', 'out')?->total ?? 0),
                ];
            })->values()->toArray();
        });

        return Inertia::render('Owner/Dashboard', [
            'metrics'          => $metrics,
            'projectSpending'  => $projectSpending,
            'cashflowTrend'    => $cashflowTrend,
        ]);
    }
}
