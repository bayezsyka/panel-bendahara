<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $months = (int) $request->query('months', 12);
        $months = max(3, min($months, 24));

        $now = now();
        $monthStart = $now->copy()->startOfMonth()->toDateString();
        $monthEnd = $now->copy()->endOfMonth()->toDateString();

        $incomeThisMonth = (int) Transaction::where('type', 'income')
            ->whereBetween('transacted_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $expenseThisMonth = (int) Transaction::where('type', 'expense')
            ->whereBetween('transacted_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $allIncome = (int) Transaction::where('type', 'income')->sum('amount');
        $allExpense = (int) Transaction::where('type', 'expense')->sum('amount');

        $kpis = [
            'incomeThisMonth' => $incomeThisMonth,
            'expenseThisMonth' => $expenseThisMonth,
            'netThisMonth' => $incomeThisMonth - $expenseThisMonth,
            'netAllTime' => $allIncome - $allExpense,
            'asOf' => $now->toDateString(),
        ];

        $series = $this->monthlySeries($months, $now);

        return inertia::render('Bendahara/Dashboard', [
            'title' => 'Dashboard Bendahara',
            'months' => $months,
            'kpis' => $kpis,
            'series' => $series,
        ]);
    }

    private function monthlySeries(int $months, Carbon $now): array
    {
        $start = $now->copy()->startOfMonth()->subMonths($months - 1)->toDateString();
        $end = $now->copy()->endOfMonth()->toDateString();

        $rows = Transaction::query()
            ->selectRaw("DATE_FORMAT(transacted_at, '%Y-%m') as ym")
            ->selectRaw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income")
            ->selectRaw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
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

            $income  = (int) ($row->income ?? 0);
            $expense = (int) ($row->expense ?? 0);

            $out[] = [
                'month' => $ym,
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
            ];

            $cursor->addMonth();
        }

        return $out;
    }
}
