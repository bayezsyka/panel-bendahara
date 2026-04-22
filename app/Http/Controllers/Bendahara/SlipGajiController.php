<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSlipGajiRequest;
use App\Models\SlipGaji;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SlipGajiController extends Controller
{
    public function create(): Response
    {
        $daftarPegawai = User::query()
            ->where('is_active', true)
            ->where('role', '!=', User::ROLE_OWNER)
            ->orderBy('name')
            ->get(['id', 'name', 'nik', 'jabatan'])
            ->map(fn(User $pegawai) => [
                'id' => $pegawai->id,
                'name' => $pegawai->name,
                'nik' => $pegawai->nik,
                'jabatan' => $pegawai->jabatan ?: Str::headline($pegawai->role),
            ])
            ->values();

        return Inertia::render('Kas/SlipGaji/Create', [
            'daftarPegawai' => $daftarPegawai,
        ]);
    }

    public function store(StoreSlipGajiRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $pegawai = User::query()->findOrFail($validated['user_id']);

        $totalPendapatan = (float) $validated['gaji_pokok']
            + (float) $validated['uang_makan']
            + (float) $validated['uang_lembur'];

        $totalPotongan = (float) $validated['bpjs_kesehatan']
            + (float) $validated['bpjs_ketenagakerjaan']
            + (float) $validated['pph21'];

        $pendapatanBersih = $totalPendapatan - $totalPotongan;

        $slipGaji = SlipGaji::query()->create([
            'user_id' => $pegawai->id,
            'employee_name' => $pegawai->name,
            'employee_nik' => $pegawai->nik,
            'employee_position' => $pegawai->jabatan ?: Str::headline($pegawai->role),
            'status' => $validated['status'],
            'periode' => $validated['periode'],
            'tanggal_tf_cash' => $validated['tanggal_tf_cash'],
            'gaji_pokok' => $validated['gaji_pokok'],
            'uang_makan' => $validated['uang_makan'],
            'uang_lembur' => $validated['uang_lembur'],
            'bpjs_kesehatan' => $validated['bpjs_kesehatan'],
            'bpjs_ketenagakerjaan' => $validated['bpjs_ketenagakerjaan'],
            'pph21' => $validated['pph21'],
            'pendapatan_bersih' => $pendapatanBersih,
            'tempat_tanggal_ttd' => $validated['tempat_tanggal_ttd'],
            'penerima' => $pegawai->name,
            'direktur' => $validated['direktur'],
            'created_by' => $request->user()?->id,
        ]);

        return redirect()
            ->route('slip-gaji.create')
            ->with('message', 'Slip gaji berhasil dibuat.')
            ->with('created_slip_gaji_id', $slipGaji->id);
    }

    public function print(int $id)
    {
        $slipGaji = SlipGaji::query()
            ->with(['pegawai', 'creator'])
            ->findOrFail($id);

        $pdf = Pdf::loadView('pdf.kas.slip-gaji-pdf', [
            'slipGaji' => $slipGaji,
        ])->setPaper('a4', 'portrait');

        $fileName = 'slip-gaji-' . Str::slug($slipGaji->employee_name . '-' . $slipGaji->id) . '.pdf';

        return $pdf->stream($fileName);
    }
}
