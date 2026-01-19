<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Mandor;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

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
        // Load relasi expenses (diurutkan terbaru untuk tampilan web) dan mandor
        $project->load(['expenses' => function ($query) {
            $query->latest('transacted_at');
        }, 'mandor']);

        // Ambil data mandor untuk dropdown edit
        $mandors = Mandor::all();

        return Inertia::render('Bendahara/Projects/Show', [
            'project' => $project,
            'mandors' => $mandors // <-- Kirim data mandor ke view Show
        ]);
    }

    public static function exportPdf(Request $request, Project $project)
    {
        // Tidak ada filter bulan lagi, ambil semua data urut berdasarkan tanggal (ASC)
        $expenses = $project->expenses()->orderBy('transacted_at', 'asc')->get();

        $periodeLabel = "Semua Riwayat";

        $pdf = Pdf::loadView('pdf.laporan_proyek', [
            'project' => $project,
            'expenses' => $expenses,
            'periode' => $periodeLabel,
        ]);

        // Nama file lebih sederhana tanpa bulan
        $fileName = 'Laporan_' . str_replace(' ', '_', $project->name) . '.pdf';

        return $pdf->stream($fileName);
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
