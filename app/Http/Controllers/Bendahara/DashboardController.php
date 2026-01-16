<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf; // Pastikan import ini ada

class DashboardController extends Controller
{
    // ... method index tetap sama ...
    public function index(Request $request)
    {
        // ... kode lama tetap sama (tetap gunakan logic 3/6 bulan untuk dashboard) ...
        $months = (int) $request->query('months', 6);
        $months = max(3, min($months, 24));

        $now = now();
        $monthStart = $now->copy()->startOfMonth()->toDateString();
        $monthEnd = $now->copy()->endOfMonth()->toDateString();

        // KPI: Total pengeluaran bulan ini (dari semua proyek)
        $expenseThisMonth = (int) Expense::whereBetween('transacted_at', [$monthStart, $monthEnd])
            ->sum('amount');

        // KPI: Total pengeluaran keseluruhan
        $totalExpense = (int) Expense::sum('amount');

        // KPI: Jumlah proyek aktif
        $activeProjects = Project::where('status', 'ongoing')->count();

        // KPI: Jumlah proyek selesai
        $completedProjects = Project::where('status', 'completed')->count();

        // Data pengeluaran per proyek (top 5)
        $topProjects = Project::withSum('expenses', 'amount')
            ->orderByDesc('expenses_sum_amount')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'status' => $p->status,
                'total' => (int) ($p->expenses_sum_amount ?? 0),
            ]);

        $kpis = [
            'expenseThisMonth' => $expenseThisMonth,
            'totalExpense' => $totalExpense,
            'activeProjects' => $activeProjects,
            'completedProjects' => $completedProjects,
            'asOf' => $now->toDateString(),
        ];

        $expenseSeries = $this->monthlyExpenseSeries($months, $now);

        $projectExpenses = Project::withSum('expenses', 'amount')
            ->having('expenses_sum_amount', '>', 0)
            ->orderByDesc('expenses_sum_amount')
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'name' => $p->name,
                'total' => (int) ($p->expenses_sum_amount ?? 0),
            ]);

        return Inertia::render('Bendahara/Dashboard', [
            'title' => 'Dashboard Bendahara',
            'months' => $months,
            'kpis' => $kpis,
            'expenseSeries' => $expenseSeries,
            'projectExpenses' => $projectExpenses,
            'topProjects' => $topProjects,
        ]);
    }

    // Method Baru: Export PDF Keseluruhan
    public function exportAllPdf(Request $request)
    {
        $withReceipts = $request->boolean('with_receipts', false);

        // Ambil SEMUA project (tidak dibatasi filter bulan dashboard)
        $projects = Project::with(['expenses' => function ($query) {
            $query->orderBy('transacted_at', 'asc');
        }])->get();

        // Siapkan data untuk view
        $data = $projects->map(function ($project) {
            // Grouping Mingguan
            $weeklyExpenses = $project->expenses->groupBy(function ($expense) {
                return Carbon::parse($expense->transacted_at)->format('W-Y'); // Minggu ke-X Tahun Y
            });

            // Grouping Harian
            $dailyExpenses = $project->expenses->groupBy(function ($expense) {
                return Carbon::parse($expense->transacted_at)->format('Y-m-d');
            });

            return [
                'name' => $project->name,
                'status' => $project->status,
                'start_date' => $project->start_date->format('d/m/Y'),
                'end_date' => $project->end_date->format('d/m/Y'),
                'duration' => $project->duration_text,
                'total_expense' => $project->expenses->sum('amount'),
                'weekly_expenses' => $weeklyExpenses,
                'daily_expenses' => $dailyExpenses,
                'expenses' => $project->expenses, // Raw list untuk lampiran nota
            ];
        });

        $pdf = Pdf::loadView('pdf.laporan_keseluruhan', [
            'projects' => $data,
            'withReceipts' => $withReceipts,
            'generatedAt' => now()->translatedFormat('d F Y H:i'),
        ]);

        return $pdf->stream('Laporan-Keseluruhan-Proyek.pdf');
    }

    // ... method monthlyExpenseSeries tetap sama ...
    private function monthlyExpenseSeries(int $months, Carbon $now): array
    {
        $start = $now->copy()->startOfMonth()->subMonths($months - 1)->toDateString();
        $end = $now->copy()->endOfMonth()->toDateString();

        $rows = Expense::query()
            ->selectRaw("DATE_FORMAT(transacted_at, '%Y-%m') as ym")
            ->selectRaw("SUM(amount) as total")
            ->whereBetween('transacted_at', [$start, $end])
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->keyBy('ym');

        $out = [];
        $cursor = $now->copy()->startOfMonth()->subMonths($months - 1);

        for ($i = 0; $i < $months; $i++) {
            $ym = $cursor->format('Y-m');
            $row = $rows->get($ym);
            $total = (int) ($row->total ?? 0);

            $out[] = [
                'month' => $ym,
                'expense' => $total,
            ];

            $cursor->addMonth();
        }

        return $out;
    }
}
