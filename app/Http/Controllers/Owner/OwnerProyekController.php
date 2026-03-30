<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Owner: Laporan Proyek Konstruksi
 * Read-only. Filters: project_id, period (month range).
 */
class OwnerProyekController extends Controller
{
    public function index(Request $request)
    {
        $months    = (int) $request->input('months', 6);
        $projectId = $request->input('project_id');
        $search    = $request->input('search', '');
        $months    = in_array($months, [1, 3, 6, 12, 24]) ? $months : 6;

        $startDate = Carbon::today()->subMonths($months)->startOfMonth()->toDateString();

        // All projects (for filter dropdown)
        $allProjects = Project::whereNull('deleted_at')
            ->select('id', 'name', 'status')
            ->orderBy('name')
            ->get()
            ->map(fn($p) => ['id' => $p->id, 'name' => $p->name, 'status' => $p->status]);

        // Spending per project (within period)
        $projectSpending = Project::whereNull('deleted_at')
            ->when($projectId, fn($q) => $q->where('id', $projectId))
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->withSum(['expenses as total_all' => fn($q) => $q], 'amount')
            ->withSum(['expenses as total_period' => fn($q) => $q->where('transacted_at', '>=', $startDate)], 'amount')
            ->withCount('expenses as jumlah_transaksi')
            ->orderByDesc('total_all')
            ->get()
            ->map(fn($p) => [
                'id'              => $p->id,
                'name'            => $p->name,
                'status'          => $p->status,
                'total_all'       => (int) ($p->total_all ?? 0),
                'total_period'    => (int) ($p->total_period ?? 0),
                'jumlah_transaksi'=> (int) ($p->jumlah_transaksi ?? 0),
            ]);

        // Monthly expense trend (per month for the selected period)
        $monthly = DB::table('expenses')
            ->select(
                DB::raw("DATE_FORMAT(transacted_at, '%Y-%m') as bulan"),
                DB::raw('SUM(amount) as total')
            )
            ->where('transacted_at', '>=', $startDate)
            ->when($projectId, fn($q) => $q->where('project_id', $projectId))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn($r) => [
                'bulan' => $r->bulan,
                'total' => (int) $r->total,
            ]);

        // Expense breakdown by type (for selected scope)
        $byType = DB::table('expenses')
            ->join('expense_types', 'expenses.expense_type_id', '=', 'expense_types.id')
            ->select('expense_types.name', DB::raw('SUM(expenses.amount) as total'))
            ->where('expenses.transacted_at', '>=', $startDate)
            ->when($projectId, fn($q) => $q->where('expenses.project_id', $projectId))
            ->groupBy('expense_types.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn($r) => ['name' => $r->name, 'total' => (int) $r->total]);

        // Latest 50 expense transactions (for detail view)
        $latestExpenses = Expense::with(['project', 'expenseType'])
            ->when($projectId, fn($q) => $q->where('project_id', $projectId))
            ->where('transacted_at', '>=', $startDate)
            ->orderByDesc('transacted_at')
            ->limit(50)
            ->get()
            ->map(fn($e) => [
                'id'           => $e->id,
                'date'         => $e->transacted_at,
                'project'      => $e->project?->name ?? '-',
                'type'         => $e->expenseType?->name ?? '-',
                'description'  => $e->title ?? $e->description ?? '-',
                'amount'       => (int) $e->amount,
            ]);

        return Inertia::render('Owner/Proyek', [
            'projectSpending' => $projectSpending,
            'monthly'         => $monthly,
            'byType'          => $byType,
            'latestExpenses'  => $latestExpenses,
            'allProjects'     => $allProjects,
            'filters' => [
                'months'     => $months,
                'project_id' => $projectId,
                'search'     => $search,
            ],
        ]);
    }
}
