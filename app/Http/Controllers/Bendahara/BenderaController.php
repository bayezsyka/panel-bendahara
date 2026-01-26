<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Bendera;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BenderaController extends Controller
{
    public function index()
    {
        $benderas = Bendera::latest()->get();

        return Inertia::render('Bendahara/Benderas/Index', [
            'benderas' => $benderas
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:benderas,name',
            'code' => 'nullable|string|max:50',
        ], [
            'name.unique' => 'Nama Bendera sudah ada.',
        ]);

        Bendera::create($validated);

        return redirect()->back()->with('message', 'Data Bendera Berhasil Ditambahkan');
    }

    public function update(Request $request, Bendera $bendera)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:benderas,name,' . $bendera->id,
            'code' => 'nullable|string|max:50',
        ], [
            'name.unique' => 'Nama Bendera sudah ada.',
        ]);

        $bendera->update($validated);

        return redirect()->back()->with('message', 'Data Bendera Berhasil Diperbarui');
    }

    public function destroy(Bendera $bendera)
    {
        // Add check if used in projects if necessary later, for now just delete
        $bendera->delete();
        return redirect()->back()->with('message', 'Data Bendera Berhasil Dihapus');
    }
}
