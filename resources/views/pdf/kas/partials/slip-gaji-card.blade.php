@php
    $directorName = $slipGaji->company->direktur ?? $slipGaji->direktur ?? 'Direktur Utama';
    $incomes = $slipGaji->items->where('component_type', 'income')->values();
    $deductions = $slipGaji->items->where('component_type', 'deduction')->values();
    $maxRows = max($incomes->count(), $deductions->count());
@endphp

<div class="salary-slip">
    <div class="slip-kop">
        <table class="slip-kop-table">
            <tr>
                <td class="slip-logo-cell">
                    <img src="{{ public_path('images/logo.png') }}" class="slip-logo">
                </td>
                <td class="slip-company-cell">
                    <div class="slip-company">PT. JAYA KARYA KONTRUKSI</div>
                    <div class="slip-subtitle">General Contractor &amp; Supplier</div>
                </td>
                <td class="slip-balance-cell"></td>
            </tr>
        </table>
    </div>

    <table class="main-table">
        <colgroup>
            <col style="width: 18%;">
            <col style="width: 32%;">
            <col style="width: 18%;">
            <col style="width: 32%;">
        </colgroup>
        <tr>
            <td colspan="4" class="title-row">
                SLIP GAJI BULAN {{ strtoupper(\Carbon\Carbon::createFromFormat('Y-m', $slipGaji->period_month)->translatedFormat('F Y')) }}
            </td>
        </tr>
        <tr>
            <td class="bold">NAMA</td>
            <td>{{ strtoupper($slipGaji->employee_name) }}</td>
            <td class="bold">PERIODE</td>
            <td>{{ strtoupper($slipGaji->periode) }}</td>
        </tr>
        <tr>
            <td class="bold">NIK</td>
            <td>{{ $slipGaji->employee_nik ?: '-' }}</td>
            <td class="bold">TANGGAL</td>
            <td>{{ strtoupper($slipGaji->tanggal_tf_cash->translatedFormat('d F Y')) }} ({{ $slipGaji->metode_pembayaran ?: 'TF' }})</td>
        </tr>
        <tr>
            <td class="bold">JABATAN</td>
            <td>{{ strtoupper($slipGaji->employee_position) }}</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td class="bold">STATUS</td>
            <td>{{ strtoupper($slipGaji->status) }}</td>
            <td></td>
            <td></td>
        </tr>
    </table>

    <table class="items-table">
        <colgroup>
            <col style="width: 35%;">
            <col style="width: 15%;">
            <col style="width: 35%;">
            <col style="width: 15%;">
        </colgroup>
        <tr>
            <th colspan="2" class="text-center bold">PENDAPATAN</th>
            <th colspan="2" class="text-center bold">POTONGAN</th>
        </tr>

        @for($i = 0; $i < $maxRows; $i++)
            <tr>
                <td>{{ isset($incomes[$i]) ? strtoupper($incomes[$i]->component_name) : '' }}</td>
                <td class="text-right amount-cell">
                    {{ isset($incomes[$i]) && $incomes[$i]->amount > 0 ? number_format($incomes[$i]->amount, 0, ',', '.') : '' }}
                </td>
                <td>{{ isset($deductions[$i]) ? strtoupper($deductions[$i]->component_name) : '' }}</td>
                <td class="text-right amount-cell">
                    {{ isset($deductions[$i]) && $deductions[$i]->amount > 0 ? number_format($deductions[$i]->amount, 0, ',', '.') : '' }}
                </td>
            </tr>
        @endfor

        <tr>
            <td class="text-right bold">TOTAL PENDAPATAN</td>
            <td class="text-right bold amount-cell">{{ number_format($slipGaji->total_pendapatan, 0, ',', '.') }}</td>
            <td class="text-right bold">TOTAL POTONGAN</td>
            <td class="text-right bold amount-cell">{{ number_format($slipGaji->total_potongan, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td style="border: none;"></td>
            <td class="text-right bold amount-cell" style="font-size: {{ (isset($slipLayout) && $slipLayout === 'six-up') ? '8.5px' : '9.5px' }};">{{ number_format($slipGaji->pendapatan_bersih, 0, ',', '.') }}</td>
            <td style="border: none;" colspan="2"></td>
        </tr>
    </table>

    <div class="signature-footer">
        <div class="signature-date">
            {{ strtoupper($slipGaji->tempat_tanggal_ttd) }}
        </div>

        <div class="signature-box">
            <table class="signature-table">
                <tr>
                    <td class="td-label">DISETUJUI,</td>
                    <td class="td-label">DITERIMA OLEH,</td>
                </tr>
                <tr>
                    <td class="td-space"></td>
                    <td class="td-space"></td>
                </tr>
                <tr>
                    <td class="td-name">
                        <div class="sign-name-block">
                            <div class="nama">{{ strtoupper($directorName) }}</div>
                            <div class="jabatan">DIREKTUR</div>
                        </div>
                    </td>
                    <td class="td-name">
                        <div class="sign-name-block">
                            <div class="nama">{{ strtoupper($slipGaji->penerima) }}</div>
                            <div class="jabatan">KARYAWAN</div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</div>
