<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Mandor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MandorController extends Controller
{
    public function index()
    {
        // Ambil data mandor terbaru dengan jumlah proyek yang dipegang
        $mandors = Mandor::withCount(['projects' => function ($query) {
            $query->where('status', 'ongoing');
        }])->latest()->get();

        return Inertia::render('Bendahara/Mandors/Index', [
            'mandors' => $mandors
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'whatsapp_number' => 'required|string|unique:mandors,whatsapp_number|min:10|max:15',
        ], [
            'whatsapp_number.unique' => 'Nomor WhatsApp sudah terdaftar.',
        ]);

        // Format nomor HP (ganti 08 jadi 628)
        $validated['whatsapp_number'] = $this->formatPhoneNumber($validated['whatsapp_number']);

        Mandor::create($validated);

        return redirect()->back()->with('message', 'Data Mandor Berhasil Ditambahkan');
    }

    public function update(Request $request, Mandor $mandor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'whatsapp_number' => 'required|string|min:10|max:15|unique:mandors,whatsapp_number,' . $mandor->id,
        ]);

        $validated['whatsapp_number'] = $this->formatPhoneNumber($validated['whatsapp_number']);

        $mandor->update($validated);

        return redirect()->back()->with('message', 'Data Mandor Berhasil Diperbarui');
    }

    public function destroy(Mandor $mandor)
    {
        $mandor->delete();
        return redirect()->back()->with('message', 'Data Mandor Berhasil Dihapus');
    }

    // Helper format nomor
    private function formatPhoneNumber($number)
    {
        $number = preg_replace('/[^0-9]/', '', $number);
        if (substr($number, 0, 2) === '08') {
            return '62' . substr($number, 1);
        }
        return $number;
    }
}
