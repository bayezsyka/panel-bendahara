<?php

namespace App\Http\Controllers\ProjectExpenses;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Project;
use App\Models\ExpenseType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf; // Pastikan import ini ada

use App\Models\PlantTransaction;

use App\Services\OfficeContextService;

class OverviewController extends Controller
{
    // ... method index tetap sama ...
    public function index(Request $request)
    {
        // Cek Office ID untuk redirect ke Dashboard Plant jika ID = 2 (Gunakan Service untuk Context)
        $officeId = app(OfficeContextService::class)->getCurrentOfficeId();

        $requiredPanel = ($officeId === 2) ? \App\Models\User::PANEL_PLANT_CASH : \App\Models\User::PANEL_FINANCE;
        if (!request()->user()->canAccessPanel($requiredPanel)) {
            abort(403, 'Anda tidak memiliki akses ke panel ini.');
        }

        if ($officeId === 2) {
            $expenseTypes = ExpenseType::orderBy('name')->get();

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

        $now = now();
        $monthStart = $now->copy()->startOfMonth()->toDateString();
        $monthEnd = $now->copy()->endOfMonth()->toDateString();

        // Gunakan Cache untuk KPI (10 menit)
        $kpis = \Illuminate\Support\Facades\Cache::remember('dashboard_kpi_' . $officeId, 600, function () use ($monthStart, $monthEnd) {
            // KPI: Total pengeluaran bulan ini (dari semua proyek)
            $expenseThisMonth = (int) Expense::whereBetween('transacted_at', [$monthStart, $monthEnd])
                ->sum('amount');

            // KPI: Total pengeluaran keseluruhan
            $totalExpense = (int) Expense::sum('amount');

            // KPI: Jumlah proyek aktif
            $activeProjects = Project::where('status', 'ongoing')->count();

            // KPI: Jumlah proyek selesai
            $completedProjects = Project::where('status', 'completed')->count();

            return [
                'expenseThisMonth' => $expenseThisMonth,
                'totalExpense' => $totalExpense,
                'activeProjects' => $activeProjects,
                'completedProjects' => $completedProjects,
            ];
        });

        // Tambahkan asOf ke KPI (tidak perlu di-cache karena waktu berubah)
        $kpis['asOf'] = $now->toDateString();

        $months = (int) $request->query('months', 6);
        $months = max(3, min($months, 24));

        $expenseSeries = $this->monthlyExpenseSeries($months, $now);

        // Data pengeluaran per proyek (top 5) - Optimized
        $topProjects = Project::select('id', 'name', 'status')
            ->withSum('expenses', 'amount')
            ->orderByDesc('expenses_sum_amount')
            ->limit(5)
            ->get();

        $projectExpenses = Project::select('name')
            ->withSum('expenses', 'amount')
            ->having('expenses_sum_amount', '>', 0)
            ->orderByDesc('expenses_sum_amount')
            ->limit(10)
            ->get();

        // Get all expense types for the filter
        $expenseTypes = ExpenseType::where('office_id', $officeId)->orderBy('name')->get(['id', 'name']);

        // Data pengeluaran per tipe biaya (untuk chart breakdown)
        $expenseByType = ExpenseType::where('office_id', $officeId)
            ->withSum('expenses', 'amount')
            ->having('expenses_sum_amount', '>', 0)
            ->orderByDesc('expenses_sum_amount')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'code' => $t->code,
                'total' => (int) ($t->expenses_sum_amount ?? 0),
            ]);

        // Data pengeluaran per tipe biaya per bulan (untuk trend analysis)
        $expenseByTypeMonthly = $this->monthlyExpenseByTypeSeries($months, $now);

        return Inertia::render('ProjectExpenses/Overview', [
            'title' => 'Dashboard Bendahara',
            'months' => $months,
            'kpis' => $kpis,
            'expenseSeries' => $expenseSeries,
            'projectExpenses' => $projectExpenses,
            'topProjects' => $topProjects,
            'expenseTypes' => $expenseTypes,
            'expenseByType' => $expenseByType,
            'expenseByTypeMonthly' => $expenseByTypeMonthly,
        ]);
    }

    // Method Baru: Export PDF Keseluruhan
    public function exportAllPdf(Request $request)
    {
        // Increase memory limit for PDF generation
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', 300);

        $withReceipts = $request->boolean('with_receipts', false);

        // Optimasi: Gunakan cursor() untuk memory efficiency dan select kolom spesifik
        // Note: DomPDF tetap butuh memory besar untuk rendering, tapi cursor() menghemat memory saat fetching data di PHP
        $projects = Project::query()
            ->select('id', 'name', 'mandor_id', 'status') // Select explicit columns
            ->with(['expenses' => function ($query) use ($withReceipts) {
                // Select only necessary columns from expenses
                $query->select('id', 'project_id', 'amount', 'transacted_at', 'title')
                    ->orderBy('transacted_at', 'asc');

                // Jika butuh receipt, tambahkan kolomnya. Jika tidak, jangan load (hemat memory)
                if ($withReceipts) {
                    $query->addSelect('receipt_image');
                }
            }, 'mandor:id,name']) // Optimasi relation mandor
            ->cursor(); // Gunakan cursor agar query tidak load semua ke memory sekaligus (LazyCollection)

        activity()
            ->causedBy($request->user())
            ->withProperties(['with_receipts' => $withReceipts])
            ->log('Melakukan export PDF laporan keseluruhan');

        $pdf = Pdf::loadView('pdf.laporan.rekapitulasi_keseluruhan', [
            'projects' => $projects,
            'withReceipts' => $withReceipts,
            'generatedAt' => now('Asia/Jakarta')->translatedFormat('d F Y H:i'),
        ]);

        return $pdf->stream('Laporan-Keseluruhan-Proyek.pdf');
    }

    // Method Baru: Export PDF berdasarkan Tipe Biaya
    public function exportByTypePdf(Request $request)
    {
        $expenseTypeId = $request->query('expense_type_id');

        if (!$expenseTypeId) {
            return back()->with('error', 'Tipe biaya tidak dipilih');
        }

        $expenseType = ExpenseType::findOrFail($expenseTypeId);

        // Ambil SEMUA expenses dengan tipe biaya tertentu, dari SEMUA proyek
        $expenses = Expense::with(['project', 'items'])
            ->where('expense_type_id', $expenseTypeId)
            ->orderBy('transacted_at', 'asc')
            ->get();

        // Group expenses by project untuk tampilan yang lebih terstruktur
        $groupedByProject = $expenses->groupBy('project_id')->map(function ($projectExpenses) {
            $project = $projectExpenses->first()->project;
            return [
                'project' => $project,
                'expenses' => $projectExpenses,
                'total' => $projectExpenses->sum('amount'),
            ];
        });

        $grandTotal = $expenses->sum('amount');

        activity()
            ->causedBy($request->user())
            ->on($expenseType)
            ->withProperties(['expense_type' => $expenseType->name])
            ->log('Melakukan export PDF laporan berdasarkan tipe biaya: ' . $expenseType->name);

        $pdf = Pdf::loadView('pdf.laporan.rekapitulasi_tipe_biaya', [
            'expenseType' => $expenseType,
            'groupedByProject' => $groupedByProject,
            'grandTotal' => $grandTotal,
            'generatedAt' => now('Asia/Jakarta')->translatedFormat('d F Y H:i'),
        ]);

        return $pdf->stream('Laporan-' . $expenseType->name . '.pdf');
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

    private function monthlyExpenseByTypeSeries(int $months, Carbon $now): array
    {
        $start = $now->copy()->startOfMonth()->subMonths($months - 1)->toDateString();
        $end = $now->copy()->endOfMonth()->toDateString();

        // Get all expense types
        $expenseTypes = ExpenseType::all();

        // Get expense data grouped by type and month
        $rows = Expense::query()
            ->selectRaw("expense_type_id, DATE_FORMAT(transacted_at, '%Y-%m') as ym, SUM(amount) as total")
            ->whereBetween('transacted_at', [$start, $end])
            ->groupBy('expense_type_id', 'ym')
            ->get();

        // Create a lookup for quick access
        $lookup = [];
        foreach ($rows as $row) {
            $lookup[$row->expense_type_id][$row->ym] = (int) $row->total;
        }

        // Build the series data
        $out = [];
        $cursor = $now->copy()->startOfMonth()->subMonths($months - 1);

        for ($i = 0; $i < $months; $i++) {
            $ym = $cursor->format('Y-m');
            $entry = ['month' => $ym];

            foreach ($expenseTypes as $type) {
                $entry[$type->name] = $lookup[$type->id][$ym] ?? 0;
            }

            $out[] = $entry;
            $cursor->addMonth();
        }

        return $out;
    }
}
