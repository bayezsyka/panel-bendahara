<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OfficeSwitcherController extends Controller
{
    public function switch(Request $request)
    {
        // Toggle logic if office_id not provided
        $currentOffice = session('current_office_view', 1);

        if ($request->has('office_id')) {
            $validated = $request->validate([
                'office_id' => 'required|integer|in:1,2',
            ]);
            $newOffice = $validated['office_id'];
        } else {
            // Toggle
            $newOffice = ($currentOffice == 1) ? 2 : 1;
        }

        session(['current_office_view' => $newOffice]);

        return redirect()->back()->with('message', 'Tampilan kantor berhasil diubah ke ' . ($newOffice == 1 ? 'Utama' : 'Plant'));
    }
}
