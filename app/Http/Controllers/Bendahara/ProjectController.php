<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Mandor; // <-- Import Model Mandor
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ProjectController extends Controller
{
    public function index()
    {
        // Load relasi mandor agar namanya bisa muncul di tabel (opsional jika ingin ditampilkan)
        $projects = Project::with('mandor')->latest()->get();

        // Ambil data semua mandor untuk dropdown
        $mandors = Mandor::all();

        return Inertia::render('Bendahara/Projects/Index', [
            'projects' => $projects,
            'mandors' => $mandors // Kirim ke frontend
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:ongoing,completed',
            'coordinates' => 'nullable|string|max:255',
            'mandor_id' => 'nullable|exists:mandors,id', // <-- Validasi Mandor
        ]);

        Project::create($validated);
        return redirect()->back()->with('message', 'Proyek Berhasil Dibuat');
    }

    public function show(Project $project)
    {
        $project->load(['expenses' => function ($query) {
            $query->latest('transacted_at');
        }, 'mandor']); // Load relasi mandor juga

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

        $fileName = 'Laporan_' . str_replace(' ', '_', $project->name) . '_' . ($monthYear ?? 'Full') . '.pdf';

        return $pdf->download($fileName);
    }

    public function update(Request $request, Project $project)
    {
        // Proteksi: Jika proyek selesai, kunci edit kecuali reopen status
        if ($project->status === 'completed' && $request->input('status') !== 'ongoing') {
            return redirect()->back()->with('message', 'Proyek sudah selesai dan terkunci. Ubah status ke "Sedang Berjalan" terlebih dahulu.');
        }

        if ($request->has('only_status') && $request->only_status == true) {
            $validated = $request->validate([
                'status' => 'required|in:ongoing,completed',
            ]);
            $project->update($validated);
            return redirect()->back()->with('message', 'Status Berhasil Diperbarui');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:ongoing,completed',
            'coordinates' => 'nullable|string|max:255',
            'mandor_id' => 'nullable|exists:mandors,id', // <-- Validasi Mandor
        ]);

        $project->update($validated);
        return redirect()->back()->with('message', 'Proyek Berhasil Diperbarui');
    }
}
