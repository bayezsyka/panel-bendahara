<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OfficeSwitcherController extends Controller
{
    public function switch(Request $request)
    {
        $validated = $request->validate([
            'office_id' => 'required|integer|in:1,2',
            'from' => 'nullable|string',
        ]);

        session(['current_office_view' => $validated['office_id']]);

        $route = 'bendahara.dashboard';
        if ($request->from === 'receivable') {
            $route = 'receivable.dashboard';
        }

        return redirect()->route($route)->with('message', 'Tampilan kantor berhasil diubah.');
    }
}
