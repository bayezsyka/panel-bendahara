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
        $projects = Project::with(['mandors', 'mandor', 'bendera'])->latest()->get();
        $mandors = Mandor::all();
        $benderas = \App\Models\Bendera::all();

        return Inertia::render('Bendahara/Projects/Index', [
            'projects' => $projects,
            'mandors' => $mandors,
            'benderas' => $benderas
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
            'mandor_ids' => 'nullable|array',
            'mandor_ids.*' => 'exists:mandors,id',
            'bendera_id' => 'nullable|exists:benderas,id',
            'location' => 'nullable|string|max:255',
        ]);

        $project = Project::create($validated);

        // Sync multiple mandors jika ada
        if ($request->has('mandor_ids') && is_array($request->mandor_ids)) {
            $project->mandors()->sync($request->mandor_ids);
        } elseif ($request->has('mandor_id') && $request->mandor_id) {
            // Backward compatibility: jika hanya mandor_id yang dikirim
            $project->mandors()->sync([$request->mandor_id]);
        }

        return redirect()->back()->with('message', 'Proyek Berhasil Dibuat');
    }

    public function show(Request $request, Project $project)
    {
        // Filter by Tipe Biaya
        $expenseTypeId = $request->input('expense_type_id');

        // PENTING: Tambahkan 'items' di sini agar detail muncul di view
        $project->load(['expenses' => function ($query) use ($expenseTypeId) {
            $query->with('items')->latest('transacted_at');
            if ($expenseTypeId) {
                $query->where('expense_type_id', $expenseTypeId);
            }
        }, 'mandors', 'mandor', 'bendera']); // Load mandors (many-to-many) dan mandor (backward compatibility)

        $mandors = Mandor::all();
        $benderas = \App\Models\Bendera::all();
        $expenseTypes = \App\Models\ExpenseType::all(); // Tambah ini

        return Inertia::render('Bendahara/Projects/Show', [
            'project' => $project,
            'mandors' => $mandors,
            'benderas' => $benderas,
            'expenseTypes' => $expenseTypes, // Tambah ini
        ]);
    }

    public static function exportPdf(Request $request, Project $project)
    {
        $expenseTypeId = $request->query('expense_type_id');
        $expenseType = null;

        $query = $project->expenses()
            ->with(['items', 'expenseType']);

        if ($expenseTypeId) {
            $query->where('expense_type_id', $expenseTypeId);
            $expenseType = \App\Models\ExpenseType::find($expenseTypeId);
        }

        $expenses = $query->orderBy('expense_type_id', 'asc')
            ->orderBy('transacted_at', 'asc')
            ->get();

        // Grouping collection
        $groupedExpenses = $expenses->groupBy(function ($item) {
            return $item->expenseType ? $item->expenseType->name : 'Lain-lain / Belum Dikategorikan';
        });

        $periodeLabel = "Semua Riwayat";
        if ($expenseType) {
            $periodeLabel = "Kategori: " . $expenseType->name;
        }

        $pdf = Pdf::loadView('pdf.laporan.biaya_proyek', [
            'project' => $project,
            'groupedExpenses' => $groupedExpenses,
            'expenses' => $expenses,
            'periode' => $periodeLabel,
            'expenseType' => $expenseType,
        ]);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($project)
            ->withProperties(['expense_type' => $expenseType ? $expenseType->name : 'Semua'])
            ->log('Melakukan export PDF laporan proyek: ' . $project->name);

        $fileName = 'Laporan_' . str_replace(' ', '_', $project->name);
        if ($expenseType) {
            $fileName .= '_' . str_replace(' ', '_', $expenseType->name);
        }
        $fileName .= '.pdf';

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
            'mandor_ids' => 'nullable|array',
            'mandor_ids.*' => 'exists:mandors,id',
            'bendera_id' => 'nullable|exists:benderas,id',
            'location' => 'nullable|string|max:255',
        ]);

        $project->update($validated);

        // Detect Muliple Mandors changes
        $oldMandors = $project->mandors->pluck('name')->toArray();
        $mandorsChanged = false;

        // Sync multiple mandors jika ada
        if ($request->has('mandor_ids') && is_array($request->mandor_ids)) {
            $project->mandors()->sync($request->mandor_ids);
            $mandorsChanged = true;
        } elseif ($request->has('mandor_id') && $request->mandor_id) {
            // Backward compatibility: jika hanya mandor_id yang dikirim
            $project->mandors()->sync([$request->mandor_id]);
            $mandorsChanged = true;
        }

        if ($mandorsChanged) {
            $project->refresh(); // Refresh relations
            $newMandors = $project->mandors->pluck('name')->toArray();

            // Log manually if list different
            sort($oldMandors);
            sort($newMandors);
            if ($oldMandors !== $newMandors) {
                activity()
                    ->causedBy(auth()->user())
                    ->performedOn($project)
                    ->withProperties([
                        'old' => ['pelaksana' => implode(', ', $oldMandors)],
                        'attributes' => ['pelaksana' => implode(', ', $newMandors)],
                    ])
                    ->log('updated'); // Use standard 'updated' event name so it shows in log as Update
            }
        }

        return redirect()->back()->with('message', 'Proyek Berhasil Diperbarui');
    }
    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->route('bendahara.projects.index')->with('message', 'Proyek Berhasil Dihapus');
    }
}
