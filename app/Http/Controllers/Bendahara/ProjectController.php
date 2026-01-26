<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Mandor;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with('mandor')->latest()->get();
        $mandors = Mandor::all();

        return Inertia::render('Bendahara/Projects/Index', [
            'projects' => $projects,
            'mandors' => $mandors
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:ongoing,completed',
            'coordinates' => 'nullable|string|max:255',
            'mandor_id' => 'nullable|exists:mandors,id',
        ]);

        Project::create($validated);
        return redirect()->back()->with('message', 'Proyek Berhasil Dibuat');
    }

    public function show(Project $project)
    {
        // PENTING: Tambahkan 'items' di sini agar detail muncul di view
        $project->load(['expenses' => function ($query) {
            $query->with('items')->latest('transacted_at');
        }, 'mandor']);

        $mandors = Mandor::all();

        return Inertia::render('Bendahara/Projects/Show', [
            'project' => $project,
            'mandors' => $mandors
        ]);
    }

    public static function exportPdf(Request $request, Project $project)
    {
        // Untuk PDF, load items juga jika ingin ditampilkan di PDF (opsional)
        $expenses = $project->expenses()->with('items')->orderBy('transacted_at', 'asc')->get();

        $periodeLabel = "Semua Riwayat";

        $pdf = Pdf::loadView('pdf.laporan_proyek', [
            'project' => $project,
            'expenses' => $expenses,
            'periode' => $periodeLabel,
        ]);

        $fileName = 'Laporan_' . str_replace(' ', '_', $project->name) . '.pdf';

        return $pdf->stream($fileName);
    }

    public function update(Request $request, Project $project)
    {
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
            'mandor_id' => 'nullable|exists:mandors,id',
        ]);

        $project->update($validated);
        return redirect()->back()->with('message', 'Proyek Berhasil Diperbarui');
    }
    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->route('bendahara.projects.index')->with('message', 'Proyek Berhasil Dihapus');
    }
}
