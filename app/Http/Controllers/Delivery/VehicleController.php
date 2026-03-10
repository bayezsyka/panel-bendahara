<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\Vehicle;
use App\Services\OfficeContextService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
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

        $vehicles = Vehicle::when($search, function ($query, $search) {
                $query->where('vehicle_number', 'like', "%{$search}%")
                      ->orWhere('driver_name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Delivery/Vehicle/Index', [
            'vehicles' => $vehicles,
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
            'driver_name' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ], [
            'vehicle_number.unique' => 'Nomor Polisi (Kendaraan) sudah ada di sistem.',
        ]);

        $validated['office_id'] = $officeId;
        $validated['is_active'] = $request->boolean('is_active', true);

        Vehicle::create($validated);

        return redirect()->back()->with('message', 'Armada Berhasil Ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        $officeId = $this->officeService->getCurrentOfficeId();

        $validated = $request->validate([
            'vehicle_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('delivery_trucks')->ignore($vehicle->id)
            ],
            'driver_name' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ], [
            'vehicle_number.unique' => 'Nomor Polisi (Kendaraan) sudah ada di sistem.',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);

        $vehicle->update($validated);

        return redirect()->back()->with('message', 'Armada Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();
        return redirect()->back()->with('message', 'Armada Berhasil Dihapus');
    }
}
