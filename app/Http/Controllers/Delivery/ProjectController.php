<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\Customer;
use App\Models\Delivery\ConcreteGrade;
use App\Models\Delivery\DeliveryProject;
use App\Services\OfficeContextService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ProjectController extends Controller
{
    protected $officeService;

    public function __construct(OfficeContextService $officeService)
    {
        $this->officeService = $officeService;
    }



    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        if (!$request->has('customer_id')) {
            return redirect()->route('delivery.customers.index')
                ->with('message', 'Silakan pilih customer terlebih dahulu sebelum membuat proyek.');
        }

        $customers = Customer::get();
        $concreteGrades = ConcreteGrade::get();

        return Inertia::render('Delivery/Project/Create', [
            'customers' => $customers,
            'concreteGrades' => $concreteGrades,
            'selectedCustomerId' => (int) $request->customer_id
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $officeId = $this->officeService->getCurrentOfficeId();

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'sub_contractor' => 'nullable|string|max:255',
            'location' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'work_type' => 'nullable|string|max:255',
            'default_concrete_grade_id' => 'nullable|exists:concrete_grades,id',
            'has_ppn' => 'boolean',
        ]);

        $validated['office_id'] = $officeId;

        $project = DeliveryProject::create($validated);

        return redirect()->route('delivery.projects.show', $project)
            ->with('message', 'Proyek Pengiriman Berhasil Dibuat');
    }

    /**
     * Display the specified resource.
     */
    public function show(DeliveryProject $project)
    {
        return Inertia::render('Delivery/Project/Show', [
            'project' => $project->load(['customer', 'defaultConcreteGrade', 'shipments.concreteGrade', 'pumpRentals'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DeliveryProject $project)
    {
        // $officeId = $this->officeService->getCurrentOfficeId();

        $customers = Customer::get();
        $concreteGrades = ConcreteGrade::get();

        return Inertia::render('Delivery/Project/Edit', [
            'project' => $project,
            'customers' => $customers,
            'concreteGrades' => $concreteGrades,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DeliveryProject $project)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'sub_contractor' => 'nullable|string|max:255',
            'location' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'work_type' => 'nullable|string|max:255',
            'default_concrete_grade_id' => 'nullable|exists:concrete_grades,id',
            'has_ppn' => 'boolean',
            'pump_rental_price' => 'nullable|numeric|min:0',
            'pump_limit_volume' => 'nullable|numeric|min:0',
            'pump_over_volume_price' => 'nullable|numeric|min:0',
            'pump_limit_pipe' => 'nullable|integer|min:0',
            'pump_over_pipe_price' => 'nullable|numeric|min:0',
        ]);

        $oldHasPpn = $project->has_ppn;
        $project->update($validated);

        // Jika setting PPN berubah, update semua shipment agar total_price_with_tax ter-update
        if ($oldHasPpn !== $project->has_ppn) {
            foreach ($project->shipments as $shipment) {
                $shipment->save();
            }
        }

        return redirect()->route('delivery.projects.show', $project)
            ->with('message', 'Proyek Pengiriman Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeliveryProject $project)
    {
        $customer = $project->customer;
        $project->delete();

        return redirect()->route('delivery.customers.show', $customer)
            ->with('message', 'Proyek Pengiriman Berhasil Dihapus');
    }

    /**
     * Export recap PDF for a specific project.
     */
    public function exportRecapPdf(DeliveryProject $project)
    {
        $shipments = $project->shipments()->with('concreteGrade')->orderBy('date')->orderBy('id')->get();

        $firstDate = $shipments->first()?->date;
        $lastDate = $shipments->last()?->date;

        $period = '-';
        if ($firstDate && $lastDate) {
            $period = Carbon::parse($firstDate)->translatedFormat('d F Y') . ' s/d ' . Carbon::parse($lastDate)->translatedFormat('d F Y');
        }

        $pdf = Pdf::loadView('pdf.delivery.rekap_pengiriman', [
            'project' => $project->load('customer'),
            'shipments' => $shipments,
            'period' => $period
        ])->setPaper('a4', 'landscape');

        $filename = 'rekap_pengiriman_' . str_replace(' ', '_', strtolower($project->name)) . '.pdf';

        return $pdf->stream($filename);
    }
}
