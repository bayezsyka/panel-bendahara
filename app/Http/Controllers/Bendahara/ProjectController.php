<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::latest()->get();

        return Inertia::render('Bendahara/Projects/Index', ['projects' => $projects]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:ongoing,completed',
        ]);

        Project::create($validated);
        return redirect()->back()->with('message', 'Proyek Berhasil Dibuat');
    }

    public function show(Project $project)
    {
        $project->load(['expenses' => function ($query) {
            $query->latest('transacted_at');
        }]);

        return Inertia::render('Bendahara/Projects/Show', ['project' => $project]);
    }

    public static function exportPdf(Request $request, Project $project)
    {
        $monthYear = $request->input('month');
        $query = $project->expenses();
        $periodeLabel = "Semua Waktu";

        if ($monthYear) {
            $date = Carbon::createFromFormat('Y-m', $monthYear);
            $query->whereYear('transacted_at', $date->year)
                ->whereMonth('transacted_at', $date->month);
            $periodeLabel = $date->translatedFormat('F Y');
        }

        $expenses = $query->orderBy('transacted_at')->get();

        $pdf = Pdf::loadView('pdf.laporan_proyek', [
            'project' => $project,
            'expenses' => $expenses,
            'periode' => $periodeLabel,
        ]);

        $fileName = 'Laporan_' . str_replace('', '_', $project->name) . '_' . ($monthyear ?? 'Full') . '.pdf';

        return $pdf->download($fileName);
    }
}
