<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\CashSource;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CashSourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sources = CashSource::orderBy('name')->get();
        return Inertia::render('Cash/Sources/Index', [
            'sources' => $sources,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:cash_sources',
            'description' => 'nullable|string',
        ]);

        CashSource::create($request->all());

        return redirect()->back()->with('message', 'Sumber Dana berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CashSource $cashSource)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:cash_sources,name,' . $cashSource->id,
            'description' => 'nullable|string',
        ]);

        $cashSource->update($request->all());

        return redirect()->back()->with('message', 'Sumber Dana berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CashSource $cashSource)
    {
        try {
            $cashSource->delete();
            return redirect()->back()->with('message', 'Sumber Dana berhasil dihapus');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()->back()->withErrors(['error' => 'Data tidak dapat dihapus karena sedang digunakan dalam transaksi.']);
            }
            throw $e;
        }
    }
}
