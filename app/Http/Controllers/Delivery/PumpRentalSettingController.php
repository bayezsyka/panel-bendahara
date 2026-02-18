<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery\PumpRentalSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PumpRentalSettingController extends Controller
{
    public function index()
    {
        // Get the first (and likely only) setting or a default one
        $setting = PumpRentalSetting::first() ?? new PumpRentalSetting([
            'pump_rental_price' => 0,
            'pump_limit_volume' => 0,
            'pump_over_volume_price' => 0,
            'pump_limit_pipe' => 0,
            'pump_over_pipe_price' => 0,
        ]);

        return Inertia::render('Delivery/PumpRentalSetting/Index', [
            'setting' => $setting
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'pump_rental_price' => 'required|numeric|min:0',
            'pump_limit_volume' => 'required|numeric|min:0',
            'pump_over_volume_price' => 'required|numeric|min:0',
            'pump_limit_pipe' => 'required|integer|min:0',
            'pump_over_pipe_price' => 'required|numeric|min:0',
        ]);

        $setting = PumpRentalSetting::first();

        if ($setting) {
            $setting->update($validated);
        } else {
            PumpRentalSetting::create($validated);
        }

        return redirect()->back()->with('message', 'Pengaturan sewa pompa berhasil diperbarui.');
    }
}
