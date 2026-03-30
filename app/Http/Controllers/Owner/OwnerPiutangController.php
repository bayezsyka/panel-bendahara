<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\ReceivableTransaction;
use App\Models\Delivery\DeliveryProject;
use App\Models\Delivery\DeliveryShipment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OwnerPiutangController extends Controller
{
    public function index(Request $request)
    {
        $search    = $request->input('search', '');
        $projectId = $request->input('project_id');           // exact project filter
        $status    = $request->input('status', 'unpaid');     // all | unpaid | paid

        // All projects for dropdown
        $allProjects = DeliveryProject::whereNull('deleted_at')
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($p) => ['id' => $p->id, 'name' => $p->name]);

        // Query projects
        $projects = DeliveryProject::with(['customer'])
            ->whereNull('deleted_at')
            ->when($projectId, fn($q) => $q->where('id', $projectId))
            ->when($search, fn($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                   ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"));
            }))
            ->orderBy('name')
            ->get();

        // Aggregate: shipment tagihan
        $shipmentsAgg = DeliveryShipment::whereNull('deleted_at')
            ->select('delivery_project_id', DB::raw('SUM(total_price_with_tax) as tagihan'))
            ->groupBy('delivery_project_id')
            ->pluck('tagihan', 'delivery_project_id');

        // Aggregate: pump rental
        $pumpAgg = DB::table('delivery_pump_rentals')
            ->whereNull('deleted_at')
            ->select('delivery_project_id', DB::raw('SUM(total_price) as tagihan'))
            ->groupBy('delivery_project_id')
            ->pluck('tagihan', 'delivery_project_id');

        // Aggregate: payments
        $paymentsAgg = ReceivableTransaction::where('type', 'payment')
            ->select('delivery_project_id', DB::raw('SUM(amount) as total'))
            ->groupBy('delivery_project_id')
            ->pluck('total', 'delivery_project_id');

        $result = $projects->map(function ($p) use ($shipmentsAgg, $pumpAgg, $paymentsAgg) {
            $tagihan  = (float) ($shipmentsAgg->get($p->id, 0));
            $pumpRaw  = (float) ($pumpAgg->get($p->id, 0));
            $pumpTax  = $p->has_ppn ? $pumpRaw * 0.11 : 0;
            $totalTagihan = $tagihan + $pumpRaw + $pumpTax;
            $bayar    = (float) ($paymentsAgg->get($p->id, 0));
            $sisa     = $totalTagihan - $bayar;
            $pct      = $totalTagihan > 0 ? round(($bayar / $totalTagihan) * 100) : 0;

            return [
                'id'            => $p->id,
                'project_name'  => $p->name,
                'customer_name' => $p->customer?->name ?? '-',
                'total_tagihan' => (int) $totalTagihan,
                'total_bayar'   => (int) $bayar,
                'sisa_piutang'  => (int) max(0, $sisa),
                'pct_lunas'     => $pct,
                'status'        => $sisa <= 0 ? 'paid' : 'unpaid',
                'has_ppn'       => $p->has_ppn,
            ];
        });

        // Status filter
        if ($status !== 'all') {
            $result = $result->filter(fn($r) => $r['status'] === $status);
        }

        $result = $result->sortByDesc('sisa_piutang')->values();

        // Summary
        $grandTagihan = $result->sum('total_tagihan');
        $grandBayar   = $result->sum('total_bayar');
        $grandSisa    = $result->sum('sisa_piutang');
        $countUnpaid  = $result->where('status', 'unpaid')->count();
        $countPaid    = $result->where('status', 'paid')->count();

        // Monthly payment trend (last 6 months)
        $paymentTrend = ReceivableTransaction::where('type', 'payment')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bulan"),
                DB::raw('SUM(amount) as total')
            )
            ->when($projectId, fn($q) => $q->where('delivery_project_id', $projectId))
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn($r) => ['bulan' => $r->bulan, 'total' => (int) $r->total]);

        // Recent payments
        $recentPayments = ReceivableTransaction::with(['deliveryProject.customer'])
            ->where('type', 'payment')
            ->when($projectId, fn($q) => $q->where('delivery_project_id', $projectId))
            ->when($search, fn($q) => $q->whereHas('deliveryProject', fn($p) =>
                $p->where('name', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"))
            ))
            ->orderByDesc('created_at')
            ->limit(30)
            ->get()
            ->map(fn($p) => [
                'id'       => $p->id,
                'date'     => $p->created_at->toDateString(),
                'project'  => $p->deliveryProject?->name ?? '-',
                'customer' => $p->deliveryProject?->customer?->name ?? '-',
                'amount'   => (int) $p->amount,
                'note'     => $p->note ?? '-',
            ]);

        return Inertia::render('Owner/Piutang', [
            'projects'       => $result,
            'recentPayments' => $recentPayments,
            'paymentTrend'   => $paymentTrend,
            'allProjects'    => $allProjects,
            'summary' => [
                'grand_tagihan' => (int) $grandTagihan,
                'grand_bayar'   => (int) $grandBayar,
                'grand_sisa'    => (int) $grandSisa,
                'count_unpaid'  => $countUnpaid,
                'count_paid'    => $countPaid,
            ],
            'filters' => [
                'search'     => $search,
                'project_id' => $projectId,
                'status'     => $status,
            ],
        ]);
    }
}
