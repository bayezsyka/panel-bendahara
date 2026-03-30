<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Delivery\DeliveryShipment;
use App\Models\Delivery\DeliveryProject;
use App\Models\Delivery\Customer;
use App\Models\Delivery\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class OwnerPengirimanController extends Controller
{
    public function index(Request $request)
    {
        // ── Filter Period ────────────────────────────────────────────────────
        $period    = $request->get('period', '30');   // 7 / 30 / 90 / 365
        $projectId = $request->get('project_id');
        $startDate = $period === 'custom'
            ? Carbon::parse($request->get('start_date', now()->subDays(30)))->startOfDay()
            : now()->subDays((int) $period)->startOfDay();
        $endDate = $period === 'custom'
            ? Carbon::parse($request->get('end_date', now()))->endOfDay()
            : now()->endOfDay();

        // ── KPI Summary ──────────────────────────────────────────────────────
        $shipmentQuery = DeliveryShipment::whereBetween('date', [$startDate, $endDate]);
        if ($projectId) {
            $shipmentQuery->where('delivery_project_id', $projectId);
        }

        $totalVolume   = (float) $shipmentQuery->clone()->sum('volume');
        $totalNilai    = (float) $shipmentQuery->clone()->sum('total_price_with_tax');
        $totalKiriman  = $shipmentQuery->clone()->count();

        // ── Volume Trend (per minggu dalam periode) ──────────────────────────
        $trendRaw = DeliveryShipment::select(
                DB::raw("DATE_FORMAT(date, '%Y-%u') as week_key"),
                DB::raw("MIN(date) as week_start"),
                DB::raw('SUM(volume) as volume'),
                DB::raw('SUM(total_price_with_tax) as nilai'),
                DB::raw('COUNT(*) as jumlah')
            )
            ->whereBetween('date', [$startDate, $endDate])
            ->when($projectId, fn($q) => $q->where('delivery_project_id', $projectId))
            ->groupBy('week_key')
            ->orderBy('week_key')
            ->get()
            ->map(fn($r) => [
                'label'   => Carbon::parse($r->week_start)->format('d M'),
                'volume'  => round((float) $r->volume, 2),
                'nilai'   => round((float) $r->nilai),
                'jumlah'  => (int) $r->jumlah,
            ]);

        // ── Per-Customer breakdown ────────────────────────────────────────────
        $perCustomer = DeliveryProject::with('customer')
            ->withCount(['shipments as jumlah_kiriman' => fn($q) =>
                $q->whereBetween('date', [$startDate, $endDate])])
            ->withSum(['shipments as total_volume' => fn($q) =>
                $q->whereBetween('date', [$startDate, $endDate])], 'volume')
            ->withSum(['shipments as total_nilai' => fn($q) =>
                $q->whereBetween('date', [$startDate, $endDate])], 'total_price_with_tax')
            ->when($projectId, fn($q) => $q->where('id', $projectId))
            ->whereHas('shipments', fn($q) => $q->whereBetween('date', [$startDate, $endDate]))
            ->orderByDesc('total_volume')
            ->limit(20)
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'project_name'   => $p->name,
                'customer_name'  => $p->customer?->name ?? '-',
                'jumlah_kiriman' => (int) $p->jumlah_kiriman,
                'total_volume'   => round((float) ($p->total_volume ?? 0), 2),
                'total_nilai'    => round((float) ($p->total_nilai ?? 0)),
            ]);

        // ── Mutu Beton breakdown ─────────────────────────────────────────────
        $perMutu = DeliveryShipment::with('concreteGrade')
            ->select(
                'concrete_grade_id',
                DB::raw('SUM(volume) as total_volume'),
                DB::raw('COUNT(*) as jumlah')
            )
            ->whereBetween('date', [$startDate, $endDate])
            ->when($projectId, fn($q) => $q->where('delivery_project_id', $projectId))
            ->groupBy('concrete_grade_id')
            ->orderByDesc('total_volume')
            ->get()
            ->map(fn($s) => [
                'mutu'         => $s->concreteGrade?->name ?? 'Tidak Diketahui',
                'total_volume' => round((float) $s->total_volume, 2),
                'jumlah'       => (int) $s->jumlah,
            ]);

        // ── Recent Shipments (50 terbaru) ─────────────────────────────────────
        $recentShipments = DeliveryShipment::with(['project.customer', 'concreteGrade'])
            ->whereBetween('date', [$startDate, $endDate])
            ->when($projectId, fn($q) => $q->where('delivery_project_id', $projectId))
            ->orderByDesc('date')
            ->limit(50)
            ->get()
            ->map(fn($s) => [
                'id'            => $s->id,
                'date'          => $s->date->format('d/m/Y'),
                'project_name'  => $s->project?->name ?? '-',
                'customer_name' => $s->project?->customer?->name ?? '-',
                'mutu'          => $s->concreteGrade?->name ?? '-',
                'volume'        => (float) $s->volume,
                'nilai'         => round((float) ($s->total_price_with_tax ?? 0)),
                'is_billed'     => $s->is_billed,
            ]);

        // ── Projects dropdown (for filter) ───────────────────────────────────
        $projects = DeliveryProject::select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($p) => ['id' => $p->id, 'name' => $p->name]);

        return Inertia::render('Owner/Pengiriman', [
            'summary' => [
                'total_volume'  => $totalVolume,
                'total_nilai'   => $totalNilai,
                'total_kiriman' => $totalKiriman,
                'avg_volume_per_kiriman' => $totalKiriman > 0 ? round($totalVolume / $totalKiriman, 2) : 0,
            ],
            'trend'           => $trendRaw,
            'per_customer'    => $perCustomer,
            'per_mutu'        => $perMutu,
            'recent_shipments'=> $recentShipments,
            'projects'        => $projects,
            'filters' => [
                'period'     => $period,
                'project_id' => $projectId,
                'start_date' => $request->get('start_date'),
                'end_date'   => $request->get('end_date'),
            ],
        ]);
    }
}
