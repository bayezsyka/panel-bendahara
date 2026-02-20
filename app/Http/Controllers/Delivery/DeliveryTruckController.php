<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\DeliveryTruck;
use App\Services\OfficeContextService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class DeliveryTruckController extends Controller
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
        $search = $request->input('search');

        // Trucks are shared across projects/users usually, or per office.
        // Assuming same pattern as ConcreteGrade: filter by search.
        $trucks = DeliveryTruck::when($search, function ($query, $search) {
            $query->where('vehicle_number', 'like', "%{$search}%")
                ->orWhere('driver_name', 'like', "%{$search}%");
        })
            ->latest()
            ->get();

        return Inertia::render('Delivery/Truck/Index', [
            'trucks' => $trucks,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $officeId = $this->officeService->getCurrentOfficeId();

        $validated = $request->validate([
            'vehicle_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('delivery_trucks')
            ],
            'driver_name' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ], [
            'vehicle_number.unique' => 'Nomor Polisi sudah ada.',
        ]);

        $validated['office_id'] = $officeId;

        DeliveryTruck::create($validated);

        return redirect()->back()->with('message', 'Truck Berhasil Ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DeliveryTruck $deliveryTruck)
    {
        // $officeId = $this->officeService->getCurrentOfficeId(); // Not used currently

        $validated = $request->validate([
            'vehicle_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('delivery_trucks')->ignore($deliveryTruck->id)
            ],
            'driver_name' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ], [
            'vehicle_number.unique' => 'Nomor Polisi sudah ada.',
        ]);

        $deliveryTruck->update($validated);

        return redirect()->back()->with('message', 'Truck Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeliveryTruck $deliveryTruck)
    {
        $deliveryTruck->delete();
        return redirect()->back()->with('message', 'Truck Berhasil Dihapus');
    }
}
