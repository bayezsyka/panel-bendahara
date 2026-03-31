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

        if (mb_strlen($q) < 2) {
            return response()->json(['results' => [], 'query' => $q, 'total' => 0]);
        }

        $term = '%' . $q . '%';

        // ── 1. Proyek Konstruksi (Panel Pengeluaran) ─────────────────────
        $constructionProjects = Project::select('id', 'name', 'status')
            ->whereNull('deleted_at')
            ->where('name', 'LIKE', $term)
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id'       => $p->id,
                'label'    => $p->name,
                'meta'     => 'Modul: Pengeluaran Proyek · ' . ($p->status === 'ongoing' ? 'Berjalan' : 'Selesai'),
                'type'     => 'project_construction',
                'route'    => route('owner.proyek', ['project_id' => $p->id]),
            ]);

        // ── 2. Proyek Delivery (Panel Piutang/Pengiriman) ────────────────
        $deliveryProjects = \App\Models\Delivery\DeliveryProject::select('id', 'name', 'customer_id')
            ->with('customer:id,name')
            ->whereNull('deleted_at')
            ->where('name', 'LIKE', $term)
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id'       => $p->id,
                'label'    => $p->name,
                'meta'     => 'Modul: Piutang & Pengiriman · Customer: ' . ($p->customer?->name ?? '-'),
                'type'     => 'project_delivery',
                'route'    => route('owner.piutang', ['project_id' => $p->id]),
            ]);

        // ── 3. Customers ───────────────────────────────────────────────
        $customers = Customer::select('id', 'name', 'contact')
            ->whereNull('deleted_at')
            ->where('name', 'LIKE', $term)
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'id'       => $c->id,
                'label'    => $c->name,
                'meta'     => 'Customer / Pelanggan · ' . ($c->contact ?? 'N/A'),
                'type'     => 'customer',
                'route'    => route('owner.piutang'),
            ]);

        // ── 4. Expenses ────────────────────────────────────────────────
        $expenses = Expense::select('id', 'title', 'description', 'amount', 'transacted_at')
            ->where(function ($q2) use ($term) {
                $q2->where('title', 'LIKE', $term)->orWhere('description', 'LIKE', $term);
            })
            ->orderByDesc('transacted_at')
            ->limit(5)
            ->get()
            ->map(fn($e) => [
                'id'       => $e->id,
                'label'    => $e->title ?? substr($e->description ?? '', 0, 40),
                'meta'     => 'Nota Pengeluaran · Rp' . number_format($e->amount, 0, ',', '.') . ' · ' . $e->transacted_at?->format('d/m/y'),
                'type'     => 'expense',
                'route'    => route('owner.proyek'),
            ]);

        $results = [
            ['group' => 'Proyek Konstruksi (Panel Pengeluaran)', 'items' => $constructionProjects->toArray()],
            ['group' => 'Proyek Batching Plant (Piutang/Kirim)', 'items' => $deliveryProjects->toArray()],
            ['group' => 'Customer / Pelanggan',                   'items' => $customers->toArray()],
            ['group' => 'Nota Pengeluaran Proyek',                'items' => $expenses->toArray()],
        ];

        $results = array_values(array_filter($results, fn($g) => count($g['items']) > 0));
        $total   = $constructionProjects->count() + $deliveryProjects->count() + $customers->count() + $expenses->count();

        return response()->json([
            'query'   => $q,
            'total'   => $total,
            'results' => $results,
        ]);
    }
}
