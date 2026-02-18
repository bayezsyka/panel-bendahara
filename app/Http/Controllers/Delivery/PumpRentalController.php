<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\DeliveryProject;
use App\Models\Delivery\DeliveryPumpRental;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PumpRentalController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:delivery_projects,id',
        ]);

        $project = DeliveryProject::with('customer')->findOrFail($request->project_id);

        // Load Global Settings
        $globalSettings = \App\Models\Delivery\PumpRentalSetting::first();

        // Apply Defaults to Project View if specific project settings are 0
        if ($globalSettings) {
            if ($project->pump_rental_price == 0) $project->pump_rental_price = $globalSettings->pump_rental_price;
            if ($project->pump_limit_volume == 0) $project->pump_limit_volume = $globalSettings->pump_limit_volume;
            if ($project->pump_over_volume_price == 0) $project->pump_over_volume_price = $globalSettings->pump_over_volume_price;
            if ($project->pump_limit_pipe == 0) $project->pump_limit_pipe = $globalSettings->pump_limit_pipe;
            if ($project->pump_over_pipe_price == 0) $project->pump_over_pipe_price = $globalSettings->pump_over_pipe_price;
        }

        return Inertia::render('Delivery/PumpRental/Create', [
            'project' => $project
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
            'docket_number' => 'nullable|string|max:50',
            'vehicle_number' => 'nullable|string|max:20',
            'driver_name' => 'nullable|string|max:100',
            'volume_pumped' => 'nullable|numeric|min:0',
            'pipes_used' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $project = DeliveryProject::findOrFail($validated['delivery_project_id']);

        // Load Global Settings
        $globalSettings = \App\Models\Delivery\PumpRentalSetting::first();

        $volumePumped = $validated['volume_pumped'] ?? 0;
        $pipesUsed = $validated['pipes_used'] ?? 0;

        // Use global settings as fallback if project settings are 0
        $limitVolume = $project->pump_limit_volume > 0 ? $project->pump_limit_volume : ($globalSettings->pump_limit_volume ?? 0);
        $limitPipe = $project->pump_limit_pipe > 0 ? $project->pump_limit_pipe : ($globalSettings->pump_limit_pipe ?? 0);

        $rentalPrice = $project->pump_rental_price > 0 ? $project->pump_rental_price : ($globalSettings->pump_rental_price ?? 0);
        $overVolumePrice = $project->pump_over_volume_price > 0 ? $project->pump_over_volume_price : ($globalSettings->pump_over_volume_price ?? 0);
        $overPipePrice = $project->pump_over_pipe_price > 0 ? $project->pump_over_pipe_price : ($globalSettings->pump_over_pipe_price ?? 0);

        // Calculate Cost (using max(0, used - limit))
        $overVolume = max(0, $volumePumped - $limitVolume);
        $overPipe = max(0, $pipesUsed - $limitPipe);

        $overVolumeCost = $overVolume * $overVolumePrice;
        $overPipeCost = $overPipe * $overPipePrice;

        $totalPrice = $rentalPrice + $overVolumeCost + $overPipeCost;

        DeliveryPumpRental::create([
            'delivery_project_id' => $project->id,
            'date' => $validated['date'],
            'docket_number' => $validated['docket_number'] ?? null,
            'vehicle_number' => $validated['vehicle_number'] ?? null,
            'driver_name' => $validated['driver_name'] ?? null,
            'volume_pumped' => $volumePumped,
            'limit_volume' => $limitVolume,
            'over_volume_price' => $overVolumePrice,
            'pipes_used' => $pipesUsed,
            'limit_pipe' => $limitPipe,
            'over_pipe_price' => $overPipePrice,
            'rental_price' => $rentalPrice,
            'total_price' => $totalPrice,
            'notes' => $validated['notes'] ?? null,
            'office_id' => $project->office_id ?? 1,
            'is_billed' => false,
        ]);

        return redirect()->route('delivery.projects.show', $project->slug)
            ->with('message', 'Penyewaan Pompa Berhasil Dicatat');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $pumpRental = DeliveryPumpRental::with('deliveryProject.customer')->findOrFail($id);

        return Inertia::render('Delivery/PumpRental/Edit', [
            'pumpRental' => $pumpRental,
            'project' => $pumpRental->deliveryProject
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'docket_number' => 'nullable|string|max:50',
            'vehicle_number' => 'nullable|string|max:20',
            'driver_name' => 'nullable|string|max:100',
            'volume_pumped' => 'nullable|numeric|min:0',
            'pipes_used' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $pumpRental = DeliveryPumpRental::findOrFail($id);
        $project = $pumpRental->deliveryProject;

        // Load Global Settings
        $globalSettings = \App\Models\Delivery\PumpRentalSetting::first();

        $volumePumped = $validated['volume_pumped'] ?? 0;
        $pipesUsed = $validated['pipes_used'] ?? 0;

        // Note: We use the stored limit/price from when it was created, or fallback to current project settings
        // Actually, usually on edit we might want to recalculate based on CURRENT project settings if they changed?
        // Or keep what was recorded? Let's use current project settings + global fallbacks like store does.

        $limitVolume = $project->pump_limit_volume > 0 ? $project->pump_limit_volume : ($globalSettings->pump_limit_volume ?? 0);
        $limitPipe = $project->pump_limit_pipe > 0 ? $project->pump_limit_pipe : ($globalSettings->pump_limit_pipe ?? 0);

        $rentalPrice = $project->pump_rental_price > 0 ? $project->pump_rental_price : ($globalSettings->pump_rental_price ?? 0);
        $overVolumePrice = $project->pump_over_volume_price > 0 ? $project->pump_over_volume_price : ($globalSettings->pump_over_volume_price ?? 0);
        $overPipePrice = $project->pump_over_pipe_price > 0 ? $project->pump_over_pipe_price : ($globalSettings->pump_over_pipe_price ?? 0);

        // Calculate Cost
        $overVolume = max(0, $volumePumped - $limitVolume);
        $overPipe = max(0, $pipesUsed - $limitPipe);

        $overVolumeCost = $overVolume * $overVolumePrice;
        $overPipeCost = $overPipe * $overPipePrice;

        $totalPrice = $rentalPrice + $overVolumeCost + $overPipeCost;

        $pumpRental->update([
            'date' => $validated['date'],
            'docket_number' => $validated['docket_number'] ?? null,
            'vehicle_number' => $validated['vehicle_number'] ?? null,
            'driver_name' => $validated['driver_name'] ?? null,
            'volume_pumped' => $volumePumped,
            'limit_volume' => $limitVolume,
            'over_volume_price' => $overVolumePrice,
            'pipes_used' => $pipesUsed,
            'limit_pipe' => $limitPipe,
            'over_pipe_price' => $overPipePrice,
            'rental_price' => $rentalPrice,
            'total_price' => $totalPrice,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('delivery.projects.show', $project->slug)
            ->with('message', 'Penyewaan Pompa Berhasil Diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $pumpRental = DeliveryPumpRental::with('deliveryProject')->findOrFail($id);
        $project = $pumpRental->deliveryProject;

        $pumpRental->delete();

        if ($project) {
            return redirect()->route('delivery.projects.show', $project->slug)
                ->with('message', 'Penyewaan Pompa Berhasil Dihapus');
        }

        return redirect()->back()->with('message', 'Penyewaan Pompa Berhasil Dihapus');
    }
}
