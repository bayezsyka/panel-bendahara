<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Mandor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MandorController extends Controller
{
    public function index()
    {
        // Ambil data mandor terbaru dengan jumlah proyek yang dipegang
        $mandors = Mandor::withCount(['projects' => function ($query) {
            $query->where('status', 'ongoing');
        }])->latest()->get();

        return Inertia::render('Bendahara/Mandors/Index', [
            'mandors' => $mandors
        ]);
    }

    public function show(Mandor $mandor)
    {
        $mandor->load(['projects' => function ($q) {
            $q->with(['bendera']); // Eager load necessary relations for project list
            $q->withCount('expenses');
            $q->orderBy('created_at', 'desc');
        }]);

        // Get all project IDs
        $projectIds = $mandor->projects->pluck('id');

        // Fetch Expenses
        $expenses = \App\Models\Expense::whereIn('project_id', $projectIds)
            ->with(['project', 'expenseType', 'items'])
            ->orderBy('transacted_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total_projects' => $mandor->projects()->count(),
            'ongoing_projects' => $mandor->projects()->where('status', 'ongoing')->count(),
            'completed_projects' => $mandor->projects()->where('status', 'completed')->count(),
            'total_expense' => $expenses->sum('amount'), // Tambahan total pengeluaran
        ];

        // Group expenses by type for additional stats if needed, or send expense types
        $expenseTypes = \App\Models\ExpenseType::all();

        return Inertia::render('Bendahara/Mandors/Show', [
            'mandor' => $mandor,
            'stats' => $stats,
            'expenses' => $expenses,
            'expenseTypes' => $expenseTypes
        ]);
    }

    public function store(Request $request)
    {
        // Format nomor HP sebelum validasi agar pengecekan unique akurat
        $request->merge([
            'whatsapp_number' => $this->formatPhoneNumber($request->whatsapp_number)
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'whatsapp_number' => 'required|string|unique:mandors,whatsapp_number|min:10|max:15',
        ], [
            'whatsapp_number.unique' => 'Nomor WhatsApp sudah terdaftar.',
        ]);

        Mandor::create($validated);

        return redirect()->back()->with('message', 'Data Mandor Berhasil Ditambahkan');
    }

    public function update(Request $request, Mandor $mandor)
    {
        // Format nomor HP sebelum validasi agar pengecekan unique akurat
        $request->merge([
            'whatsapp_number' => $this->formatPhoneNumber($request->whatsapp_number)
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'whatsapp_number' => 'required|string|min:10|max:15|unique:mandors,whatsapp_number,' . $mandor->id,
        ]);

        $mandor->update($validated);

        return redirect()->back()->with('message', 'Data Mandor Berhasil Diperbarui');
    }

    public function destroy(Mandor $mandor)
    {
        $mandor->delete();
        return redirect()->back()->with('message', 'Data Mandor Berhasil Dihapus');
    }

    // Helper format nomor
    private function formatPhoneNumber($number)
    {
        $number = preg_replace('/[^0-9]/', '', $number);
        if (substr($number, 0, 2) === '08') {
            return '62' . substr($number, 1);
        }
        return $number;
    }

    public function exportDailyExpenses(Request $request, Mandor $mandor)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $date = $request->input('date');

        // 1. Get Project IDs handled by this Mandor
        $projectIds = $mandor->projects->pluck('id');

        // 2. Fetch Expenses for these projects on the specific date
        $expenses = \App\Models\Expense::whereIn('project_id', $projectIds)
            ->whereDate('transacted_at', $date)
            ->with(['project', 'items', 'expenseType'])
            ->get();

        if ($expenses->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada pengeluaran pada tanggal tersebut.');
        }

        // 3. Group by Project
        // Structure: 
        // [ 
        //   ProjectId => [
        //      'project_name' => 'Name',
        //      'project_id' => ID,
        //      'items' => [ ...all items merged... ],
        //      'total_amount' => sum
        //   ]
        // ]
        $groupedData = [];

        foreach ($expenses as $expense) {
            $projectId = $expense->project_id;

            if (!isset($groupedData[$projectId])) {
                $groupedData[$projectId] = [
                    'project_id' => $expense->project->id,
                    'project_name' => $expense->project->name,
                    'items' => [],
                    'total_amount' => 0,
                ];
            }

            // Merge items
            foreach ($expense->items as $item) {
                $groupedData[$projectId]['items'][] = [
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total_price' => $item->total_price,
                    'expense_type' => $expense->expenseType ? $expense->expenseType->name : '-',
                    'note' => $expense->description // Use expense description as note for items if needed
                ];
                $groupedData[$projectId]['total_amount'] += $item->total_price;
            }
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.voucher.kas_keluar', [
            'mandor' => $mandor,
            'groupedData' => $groupedData,
            'date' => $date
        ]);

        return $pdf->stream('Laporan_Harian_' . $mandor->name . '_' . $date . '.pdf');
    }
}
