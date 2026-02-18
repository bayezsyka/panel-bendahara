<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\ConcreteGrade;
use App\Models\Delivery\DeliveryProject;
use App\Models\Delivery\DeliveryShipment;
use App\Services\OfficeContextService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ShipmentController extends Controller
{
    protected $officeService;

    public function __construct(OfficeContextService $officeService)
    {
        $this->officeService = $officeService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        $carbonDate = Carbon::parse($date);

        $prevDate = $carbonDate->copy()->subDay()->toDateString();
        $nextDate = $carbonDate->copy()->addDay()->toDateString();

        $query = DeliveryShipment::query()
            ->with(['project.customer', 'concreteGrade']);

        // Filter by Date (Main Navigation)
        $query->whereDate('date', $date);

        // Optional search if needed on top of date
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('docket_number', 'like', "%{$request->search}%")
                    ->orWhere('vehicle_number', 'like', "%{$request->search}%")
                    ->orWhere('driver_name', 'like', "%{$request->search}%")
                    ->orWhereHas('project', function ($q2) use ($request) {
                        $q2->where('name', 'like', "%{$request->search}%")
                            ->orWhereHas('customer', function ($q3) use ($request) {
                                $q3->where('name', 'like', "%{$request->search}%");
                            });
                    });
            });
        }

        $shipments = $query->orderBy('id', 'asc')->get();

        return Inertia::render('Delivery/Shipment/Index', [
            'shipments' => $shipments,
            'selectedDate' => $date,
            'prevDate' => $prevDate,
            'nextDate' => $nextDate,
            'filters' => $request->only(['search'])
        ]);
    }

    public function exportPdf(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        $shipments = DeliveryShipment::with(['project.customer', 'concreteGrade'])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $initialDate = Carbon::parse($startDate);
        $finalDate = Carbon::parse($endDate);

        if ($initialDate->equalTo($finalDate)) {
            $periodText = 'Tanggal: ' . $initialDate->translatedFormat('d F Y');
        } else {
            $periodText = 'Periode: ' . $initialDate->translatedFormat('d F Y') . ' s/d ' . $finalDate->translatedFormat('d F Y');
        }

        $pdf = Pdf::loadView('pdf.delivery.shipment_report', [
            'title' => 'Laporan Pengiriman Beton',
            'periodText' => $periodText,
            'shipments' => $shipments,
            'totalVolume' => $shipments->sum('volume'),
            'totalAmount' => $shipments->sum('total_price'),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('laporan_pengiriman_' . $startDate . '_' . $endDate . '.pdf');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $projects = DeliveryProject::with('customer')
            ->get();

        $concreteGrades = ConcreteGrade::get();

        $selectedProject = null;
        if ($request->project_id) {
            $selectedProject = DeliveryProject::with('defaultConcreteGrade')->find($request->project_id);
        }

        return Inertia::render('Delivery/Shipment/Create', [
            'projects' => $projects,
            'concreteGrades' => $concreteGrades,
            'selectedProjectId' => $request->project_id,
            'defaultValues' => $selectedProject ? [
                'concrete_grade_id' => $selectedProject->default_concrete_grade_id,
                'price_per_m3' => $selectedProject->defaultConcreteGrade ? $selectedProject->defaultConcreteGrade->price : 0
            ] : null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'delivery_project_id' => 'required|exists:delivery_projects,id',
            'date' => 'required|date',
            'docket_number' => 'nullable|string|max:255',
            'rit_number' => 'required|integer|min:1',
            'concrete_grade_id' => 'required|exists:concrete_grades,id',
            'slump' => 'nullable|string|max:50',
            'volume' => 'required|numeric|min:0',
            'vehicle_number' => 'nullable|string|max:50',
            'driver_name' => 'nullable|string|max:255',
            'price_per_m3' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $shipment = DeliveryShipment::create($validated);

        return redirect()->route('delivery.projects.show', $shipment->project)
            ->with('message', 'Surat Jalan Berhasil Dicatat');
    }

    /**
     * Display the specified resource.
     */
    public function show(DeliveryShipment $shipment)
    {
        // Redirect to the project detail page where shipment is displayed in context
        return redirect()->route('delivery.projects.show', $shipment->project);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DeliveryShipment $shipment)
    {
        $projects = DeliveryProject::with('customer')
            ->get();

        $concreteGrades = ConcreteGrade::get();

        return Inertia::render('Delivery/Shipment/Edit', [
            'shipment' => $shipment->load('project'),
            'projects' => $projects,
            'concreteGrades' => $concreteGrades,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DeliveryShipment $shipment)
    {
        $validated = $request->validate([
            'delivery_project_id' => 'required|exists:delivery_projects,id',
            'date' => 'required|date',
            'docket_number' => 'nullable|string|max:255',
            'rit_number' => 'required|integer|min:1',
            'concrete_grade_id' => 'required|exists:concrete_grades,id',
            'slump' => 'nullable|string|max:50',
            'volume' => 'required|numeric|min:0',
            'vehicle_number' => 'nullable|string|max:50',
            'driver_name' => 'nullable|string|max:255',
            'price_per_m3' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $shipment->update($validated);

        return redirect()->route('delivery.projects.show', $shipment->project)
            ->with('message', 'Surat Jalan Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeliveryShipment $shipment)
    {
        $project = $shipment->project;
        $shipment->delete();

        return redirect()->route('delivery.projects.show', $project)
            ->with('message', 'Surat Jalan Berhasil Dihapus');
    }
}
