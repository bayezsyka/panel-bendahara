<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSlipGajiRequest;
use App\Models\SalaryComponentType;
use App\Models\SalaryEmployee;
use App\Models\SlipGaji;
use App\Services\SalaryCompanyContextService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SlipGajiController extends Controller
{
    public function index(Request $request, SalaryCompanyContextService $salaryCompanyContextService): Response
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();
        $selectedMonth = $this->resolveMonth($request->string('month')->toString());
        $selectedMonthLabel = $this->buildMonthLabel($selectedMonth);

        $employees = collect();
        $rows = collect();

        if ($currentCompany) {
            $employees = $currentCompany->employees()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'uuid', 'name', 'nik', 'jabatan']);

            $slips = SlipGaji::query()
                ->where('salary_company_id', $currentCompany->id)
                ->where('period_month', $selectedMonth)
                ->whereIn('salary_employee_id', $employees->pluck('id'))
                ->get([
                    'id',
                    'uuid',
                    'salary_employee_id',
                    'is_finalized',
                    'tanggal_tf_cash',
                    'total_pendapatan',
                    'total_potongan',
                    'pendapatan_bersih',
                ])
                ->keyBy('salary_employee_id');

            $rows = $employees->map(function (SalaryEmployee $employee) use ($slips) {
                /** @var SlipGaji|null $slip */
                $slip = $slips->get($employee->id);

                return [
                    'id' => $employee->id,
                    'uuid' => $employee->uuid,
                    'name' => $employee->name,
                    'nik' => $employee->nik,
                    'jabatan' => $employee->jabatan,
                    'slip' => $slip ? [
                        'id' => $slip->id,
                        'uuid' => $slip->uuid,
                        'is_finalized' => (bool) $slip->is_finalized,
                        'tanggal_tf_cash' => $slip->tanggal_tf_cash?->format('Y-m-d'),
                        'total_pendapatan' => (float) $slip->total_pendapatan,
                        'total_potongan' => (float) $slip->total_potongan,
                        'pendapatan_bersih' => (float) $slip->pendapatan_bersih,
                    ] : null,
                ];
            })->values();
        }

        return Inertia::render('Kas/SlipGaji/Index', [
            'rows' => $rows,
            'selectedMonth' => $selectedMonth,
            'selectedMonthLabel' => $selectedMonthLabel,
            'selectedCompany' => $currentCompany ? [
                'id' => $currentCompany->id,
                'name' => $currentCompany->name,
                'direktur' => $currentCompany->direktur,
            ] : null,
        ]);
    }

    public function create(Request $request, SalaryCompanyContextService $salaryCompanyContextService): Response
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();
        $selectedMonth = $this->resolveMonth($request->string('month')->toString());
        $selectedEmployeeUuid = $request->string('employee')->toString();

        $daftarPegawai = collect();
        if ($currentCompany) {
            $daftarPegawai = $currentCompany->employees()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'uuid', 'name', 'nik', 'jabatan'])
                ->values();
        }

        $incomeTypes = SalaryComponentType::query()
            ->where('type', SalaryComponentType::TYPE_INCOME)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $deductionTypes = SalaryComponentType::query()
            ->where('type', SalaryComponentType::TYPE_DEDUCTION)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        $selectedEmployee = $daftarPegawai->firstWhere('uuid', $selectedEmployeeUuid);
        $existingSlip = null;
        $previousSlip = null;

        if ($currentCompany && $selectedEmployee) {
            $existingSlip = SlipGaji::query()
                ->with('items')
                ->where('salary_company_id', $currentCompany->id)
                ->where('salary_employee_id', $selectedEmployee->id)
                ->where('period_month', $selectedMonth)
                ->first();

            if (! $existingSlip) {
                $previousSlip = SlipGaji::query()
                    ->with('items')
                    ->where('salary_company_id', $currentCompany->id)
                    ->where('salary_employee_id', $selectedEmployee->id)
                    ->orderBy('period_month', 'desc')
                    ->first();
            }
        }

        $availableStatuses = SlipGaji::query()
            ->whereNotNull('status')
            ->distinct()
            ->pluck('status');

        return Inertia::render('Kas/SlipGaji/Create', [
            'daftarPegawai' => $daftarPegawai,
            'incomeTypes' => $incomeTypes,
            'deductionTypes' => $deductionTypes,
            'availableStatuses' => $availableStatuses,
            'selectedMonth' => $selectedMonth,
            'selectedMonthLabel' => $this->buildMonthLabel($selectedMonth),
            'initialForm' => $this->buildInitialForm(
                $incomeTypes,
                $deductionTypes,
                $selectedMonth,
                $selectedEmployee?->uuid,
                $existingSlip,
                $previousSlip,
                $selectedEmployee
            ),
            'existingSlip' => $existingSlip ? [
                'id' => $existingSlip->id,
                'uuid' => $existingSlip->uuid,
                'is_finalized' => (bool) $existingSlip->is_finalized,
            ] : null,
            'selectedCompany' => $currentCompany ? [
                'id' => $currentCompany->id,
                'name' => $currentCompany->name,
                'direktur' => $currentCompany->direktur,
            ] : null,
        ]);
    }

    public function store(StoreSlipGajiRequest $request, SalaryCompanyContextService $salaryCompanyContextService): RedirectResponse
    {
        $validated = $request->validated();
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();

        if (! $currentCompany) {
            return redirect()->back()->with('error', 'Belum ada perusahaan aktif untuk panel Slip Gaji.');
        }

        /** @var SalaryEmployee $pegawai */
        $pegawai = SalaryEmployee::query()->where('uuid', $validated['employee_id'])->firstOrFail();
        abort_unless($pegawai->salary_company_id === $currentCompany->id, 422, 'Pegawai tidak terdaftar pada perusahaan aktif.');

        [$incomeItems, $totalPendapatan] = $this->buildItems(
            collect($validated['income_items']),
            SalaryComponentType::TYPE_INCOME
        );

        [$deductionItems, $totalPotongan] = $this->buildItems(
            collect($validated['deduction_items']),
            SalaryComponentType::TYPE_DEDUCTION
        );

        $pendapatanBersih = $totalPendapatan - $totalPotongan;

        $slipGaji = SlipGaji::query()->firstOrNew([
            'salary_company_id' => $currentCompany->id,
            'salary_employee_id' => $pegawai->id,
            'period_month' => $validated['period_month'],
        ]);

        $slipGaji->fill([
            'user_id' => $request->user()->id,
            'salary_company_id' => $currentCompany->id,
            'salary_employee_id' => $pegawai->id,
            'employee_name' => $pegawai->name,
            'employee_nik' => $pegawai->nik,
            'employee_position' => $pegawai->jabatan ?: '-',
            'status' => $validated['status'] ?? $pegawai->jabatan ?? 'Karyawan Tetap',
            'periode' => '1 - 25 '.Carbon::createFromFormat('Y-m', $validated['period_month'])->translatedFormat('F Y'),
            'period_month' => $validated['period_month'],
            'is_finalized' => true,
            'tanggal_tf_cash' => $validated['tanggal_tf_cash'],
            'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'TF',
            'gaji_pokok' => 0,
            'uang_makan' => 0,
            'uang_lembur' => 0,
            'bpjs_kesehatan' => 0,
            'bpjs_ketenagakerjaan' => 0,
            'pph21' => 0,
            'total_pendapatan' => $totalPendapatan,
            'total_potongan' => $totalPotongan,
            'pendapatan_bersih' => $pendapatanBersih,
            'tempat_tanggal_ttd' => 'Brebes, '.Carbon::parse($validated['tanggal_ttd'])->translatedFormat('d F Y'),
            'penerima' => $pegawai->name,
            'direktur' => $currentCompany->direktur ?: 'Direktur Utama',
            'created_by' => $request->user()?->id,
        ]);
        $slipGaji->save();

        $slipGaji->items()->delete();
        $slipGaji->items()->createMany($incomeItems->merge($deductionItems)->all());

        return redirect()
            ->route('slip-gaji.create', [
                'employee' => $pegawai->uuid,
                'month' => $validated['period_month'],
            ])
            ->with('message', 'Slip gaji berhasil disimpan.')
            ->with('created_slip_gaji_uuid', $slipGaji->uuid);
    }

    public function reset(string $uuid, Request $request, SalaryCompanyContextService $salaryCompanyContextService): RedirectResponse
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();
        abort_if(! $currentCompany, 404);

        $slipGaji = SlipGaji::query()
            ->where('uuid', $uuid)
            ->where('salary_company_id', $currentCompany->id)
            ->firstOrFail();

        $slipGaji->forceFill([
            'is_finalized' => false,
        ])->save();

        return redirect()
            ->route('slip-gaji.create', [
                'employee' => $slipGaji->employee?->uuid,
                'month' => $slipGaji->period_month,
            ])
            ->with('message', 'Slip gaji dikembalikan ke status belum diisi.');
    }

    public function print(string $uuid)
    {
        $slipGaji = SlipGaji::query()
            ->with(['creator', 'company', 'items'])
            ->where('uuid', $uuid)
            ->where('is_finalized', true)
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.kas.slip-gaji-pdf', [
            'slipGaji' => $slipGaji,
        ])->setPaper('a4', 'portrait');

        $fileName = 'slip-gaji-'.str($slipGaji->employee_name.'-'.$slipGaji->id)->slug().'.pdf';

        return $pdf->stream($fileName);
    }

    public function printAll(Request $request, SalaryCompanyContextService $salaryCompanyContextService)
    {
        $currentCompany = $salaryCompanyContextService->getCurrentCompany();
        abort_if(! $currentCompany, 404);

        $selectedMonth = $this->resolveMonth($request->string('month')->toString());

        $slips = SlipGaji::query()
            ->with(['company', 'creator', 'items'])
            ->where('salary_company_id', $currentCompany->id)
            ->where('period_month', $selectedMonth)
            ->where('is_finalized', true)
            ->orderBy('employee_name')
            ->get();

        abort_if($slips->isEmpty(), 404, 'Belum ada slip gaji untuk periode ini.');

        if ($request->string('mode')->toString() === 'uniform') {
            $metode = $request->string('metode')->toString();
            $tglTf = $request->string('tgl_tf')->toString();
            $tglTtd = $request->string('tgl_ttd')->toString();

            $slips->each(function ($slip) use ($metode, $tglTf, $tglTtd) {
                if ($metode) {
                    $slip->metode_pembayaran = $metode;
                }
                if ($tglTf) {
                    $slip->tanggal_tf_cash = Carbon::parse($tglTf);
                }
                if ($tglTtd) {
                    $slip->tempat_tanggal_ttd = 'Brebes, '.Carbon::parse($tglTtd)->translatedFormat('d F Y');
                }
            });
        }

        $pdf = Pdf::loadView('pdf.kas.slip-gaji-batch-pdf', [
            'slips' => $slips,
            'selectedMonthLabel' => $this->buildMonthLabel($selectedMonth),
            'selectedCompany' => $currentCompany,
        ])->setPaper('a4', 'portrait');

        $fileName = 'slip-gaji-'.str($currentCompany->name.'-'.$selectedMonth)->slug().'.pdf';

        return $pdf->stream($fileName);
    }

    private function buildItems(Collection $items, string $type): array
    {
        $componentTypes = SalaryComponentType::query()
            ->where('type', $type)
            ->whereIn('id', $items->pluck('salary_component_type_id')->filter()->all())
            ->get()
            ->keyBy('id');

        $preparedItems = $items->map(function ($item, $index) use ($componentTypes, $type) {
            /** @var SalaryComponentType|null $componentType */
            $componentType = $componentTypes->get($item['salary_component_type_id']);
            if (! $componentType) {
                return null;
            }

            return [
                'salary_component_type_id' => $componentType->id,
                'component_name' => $componentType->name,
                'component_type' => $type,
                'amount' => (float) ($item['amount'] ?? 0),
                'sort_order' => $componentType->sort_order ?: ($index + 1),
            ];
        })->filter()->values();

        $total = $preparedItems->sum('amount');

        return [$preparedItems, $total];
    }

    private function buildInitialForm(
        Collection $incomeTypes,
        Collection $deductionTypes,
        string $selectedMonth,
        ?string $selectedEmployeeUuid,
        ?SlipGaji $existingSlip,
        ?SlipGaji $previousSlip,
        ?SalaryEmployee $selectedEmployee = null
    ): array {
        $sourceSlip = $existingSlip ?? $previousSlip;
        $items = $sourceSlip?->items?->keyBy('salary_component_type_id') ?? collect();
        $defaultDate = Carbon::createFromFormat('Y-m', $selectedMonth)->setDay(26)->format('Y-m-d');

        return [
            'employee_id' => $selectedEmployeeUuid ?? '',
            'period_month' => $selectedMonth,
            'status' => $existingSlip ? $existingSlip->status : ($previousSlip ? $previousSlip->status : ($selectedEmployee?->jabatan ?? '')),
            'metode_pembayaran' => $existingSlip ? $existingSlip->metode_pembayaran : ($previousSlip ? $previousSlip->metode_pembayaran : 'TF'),
            'tanggal_tf_cash' => $existingSlip ? $existingSlip->tanggal_tf_cash->format('Y-m-d') : $defaultDate,
            'income_items' => $incomeTypes->map(fn ($type) => [
                'salary_component_type_id' => $type->id,
                'name' => $type->name,
                'amount' => $items->has($type->id) ? (string) $items->get($type->id)->amount : '',
            ])->values()->all(),
            'deduction_items' => $deductionTypes->map(fn ($type) => [
                'salary_component_type_id' => $type->id,
                'name' => $type->name,
                'amount' => $items->has($type->id) ? (string) $items->get($type->id)->amount : '',
            ])->values()->all(),
            'tanggal_ttd' => $this->resolveTanggalTtd($sourceSlip?->tempat_tanggal_ttd, $defaultDate),
        ];
    }

    private function resolveTanggalTtd(?string $tempatTanggalTtd, string $defaultDate): string
    {
        if (! $tempatTanggalTtd) {
            return $defaultDate;
        }

        $dateText = trim((string) preg_replace('/^[^,]+,\s*/u', '', $tempatTanggalTtd));

        if ($dateText === '') {
            return $defaultDate;
        }

        try {
            return Carbon::createFromLocaleFormat('d F Y', 'id', $dateText)->format('Y-m-d');
        } catch (Throwable) {
            // Fallback for legacy values that may already be stored in a parseable format.
        }

        try {
            return Carbon::parse($dateText)->format('Y-m-d');
        } catch (Throwable) {
            return $defaultDate;
        }
    }

    private function resolveMonth(?string $month): string
    {
        if ($month && preg_match('/^\d{4}\-\d{2}$/', $month) === 1) {
            return $month;
        }

        return now()->format('Y-m');
    }

    private function buildMonthLabel(string $month): string
    {
        return Carbon::createFromFormat('Y-m', $month)->translatedFormat('F Y');
    }
}
