<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Expense;
use App\Models\Delivery\Customer;
use App\Models\Delivery\DeliveryShipment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Universal Read-Only Search for Owner Dashboard.
     *
     * Searches across: Projects, Customers, Expenses, DeliveryShipments.
     * Returns grouped JSON results. No mutations. Minimum 2 chars required.
     */
    public function index(Request $request): JsonResponse
    {
        $q = trim($request->query('q', ''));

        // Require at least 2 characters to search
        if (mb_strlen($q) < 2) {
            return response()->json(['results' => [], 'query' => $q, 'total' => 0]);
        }

        $term = '%' . $q . '%';

        // ── 1. Projects (cari name) ─────────────────────────────────────
        $projects = Project::select('id', 'name', 'status', 'created_at')
            ->whereNull('deleted_at')
            ->where('name', 'LIKE', $term)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id'       => $p->id,
                'label'    => $p->name,
                'meta'     => $p->status === 'ongoing' ? 'Sedang Berjalan' : 'Selesai',
                'meta_type'=> $p->status,
                'type'     => 'project',
                'icon'     => 'building',
            ]);

        // ── 2. Customers (cari name, contact) ──────────────────────────
        $customers = Customer::select('id', 'name', 'contact', 'slug')
            ->whereNull('deleted_at')
            ->where(function ($q2) use ($term) {
                $q2->where('name', 'LIKE', $term)
                   ->orWhere('contact', 'LIKE', $term);
            })
            ->orderBy('name')
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'id'       => $c->id,
                'label'    => $c->name,
                'meta'     => $c->contact ?? 'Tidak ada kontak',
                'meta_type'=> 'neutral',
                'type'     => 'customer',
                'icon'     => 'user',
            ]);

        // ── 3. Expenses (cari title, description) ──────────────────────
        $expenses = Expense::select('id', 'title', 'description', 'amount', 'transacted_at')
            ->where(function ($q2) use ($term) {
                $q2->where('title', 'LIKE', $term)
                   ->orWhere('description', 'LIKE', $term);
            })
            ->orderByDesc('transacted_at')
            ->limit(5)
            ->get()
            ->map(fn($e) => [
                'id'       => $e->id,
                'label'    => $e->title ?? substr($e->description ?? '', 0, 60),
                'meta'     => 'Rp ' . number_format($e->amount ?? 0, 0, ',', '.') . ' — ' . ($e->transacted_at?->format('d M Y') ?? '-'),
                'meta_type'=> 'neutral',
                'type'     => 'expense',
                'icon'     => 'receipt',
            ]);

        // ── 4. Delivery Shipments (cari docket_number, driver_name, vehicle_number) ──
        $shipments = DeliveryShipment::select('id', 'docket_number', 'driver_name', 'vehicle_number', 'date', 'volume')
            ->whereNull('deleted_at')
            ->where(function ($q2) use ($term) {
                $q2->where('docket_number', 'LIKE', $term)
                   ->orWhere('driver_name',   'LIKE', $term)
                   ->orWhere('vehicle_number', 'LIKE', $term);
            })
            ->orderByDesc('date')
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'id'       => $s->id,
                'label'    => 'DN: ' . ($s->docket_number ?? '-'),
                'meta'     => trim(($s->driver_name ?? '') . ' · ' . ($s->vehicle_number ?? '') . ' · ' . number_format($s->volume ?? 0, 2) . ' m³', ' · '),
                'meta_type'=> 'neutral',
                'type'     => 'shipment',
                'icon'     => 'truck',
            ]);

        $results = [
            ['group' => 'Proyek Konstruksi', 'type' => 'project',  'items' => $projects->toArray()],
            ['group' => 'Customer',           'type' => 'customer', 'items' => $customers->toArray()],
            ['group' => 'Pengeluaran Proyek', 'type' => 'expense',  'items' => $expenses->toArray()],
            ['group' => 'Pengiriman (SJ)',    'type' => 'shipment', 'items' => $shipments->toArray()],
        ];

        // Strip empty groups
        $results = array_values(array_filter($results, fn($g) => count($g['items']) > 0));

        $total = $projects->count() + $customers->count() + $expenses->count() + $shipments->count();

        return response()->json([
            'query'   => $q,
            'total'   => $total,
            'results' => $results,
        ]);
    }
}
