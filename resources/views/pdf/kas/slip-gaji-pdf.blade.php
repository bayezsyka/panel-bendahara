<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $slipGaji->employee_name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #000;
            font-size: 11px;
            margin: 20px;
            background: #ffffff;
        }



        .main-table {
            width: 100%;
            border-collapse: collapse;
        }

        .main-table td, .main-table th {
            padding: 4px 6px;
            vertical-align: top;
        }

        .title-row {
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            padding-bottom: 15px !important;
        }

        .bold {
            font-weight: bold;
        }

        .bordered {
            border: 1px solid #000;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .spacer-row {
            height: 15px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .items-table td, .items-table th {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: middle;
        }

        .signature-box {
            margin-top: 25px;
            page-break-inside: avoid;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-table td {
            width: 50%;
            border: 1px solid #000;
            text-align: center;
            vertical-align: top;
        }

        .td-label {
            padding: 8px 5px;
            font-weight: bold;
        }

        .td-space {
            height: 80px;
        }

        .td-name {
            padding: 6px 10px 5px 5px;
            text-align: center;
        }

        .sign-name-block {
            display: inline-block;
            text-align: center;
        }

        .sign-name-block .nama {
            font-weight: bold;
            font-size: 12px;
            display: block;
            text-decoration: underline;
        }

        .sign-name-block .jabatan {
            font-size: 11px;
            display: block;
            margin-top: 3px;
        }
    </style>
</head>
<body>
    @php
        $directorName = $slipGaji->company->direktur ?? $slipGaji->direktur ?? 'Direktur Utama';
    @endphp
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <table class="main-table">
        <tr>
            <td colspan="4" class="title-row">
                SLIP GAJI BULAN {{ strtoupper(\Carbon\Carbon::createFromFormat('Y-m', $slipGaji->period_month)->translatedFormat('F Y')) }}
            </td>
        </tr>
        <tr>
            <td class="bold" style="width: 25%;">NAMA</td>
            <td style="width: 25%;">{{ strtoupper($slipGaji->employee_name) }}</td>
            <td class="bold" style="width: 25%;">PERIODE</td>
            <td style="width: 25%;">{{ strtoupper($slipGaji->periode) }}</td>
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
        <tr>
            <th colspan="2" class="text-center bold">PENDAPATAN</th>
            <th colspan="2" class="text-center bold">POTONGAN</th>
        </tr>
        @php
            $incomes = $slipGaji->items->where('component_type', 'income')->values();
            $deductions = $slipGaji->items->where('component_type', 'deduction')->values();
            $maxRows = max($incomes->count(), $deductions->count());
        @endphp
        
        @for($i = 0; $i < $maxRows; $i++)
        <tr>
            <td style="width: 30%;">{{ isset($incomes[$i]) ? strtoupper($incomes[$i]->component_name) : '' }}</td>
            <td style="width: 20%;" class="text-right">
                {{ isset($incomes[$i]) && $incomes[$i]->amount > 0 ? number_format($incomes[$i]->amount, 0, ',', '.') : '' }}
            </td>
            <td style="width: 30%;">{{ isset($deductions[$i]) ? strtoupper($deductions[$i]->component_name) : '' }}</td>
            <td style="width: 20%;" class="text-right">
                {{ isset($deductions[$i]) && $deductions[$i]->amount > 0 ? number_format($deductions[$i]->amount, 0, ',', '.') : '' }}
            </td>
        </tr>
        @endfor

        <tr>
            <td class="text-right bold">TOTAL PENDAPATAN</td>
            <td class="text-right bold">{{ number_format($slipGaji->total_pendapatan, 0, ',', '.') }}</td>
            <td class="text-right bold">TOTAL POTONGAN</td>
            <td class="text-right bold">{{ number_format($slipGaji->total_potongan, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td style="border: none;"></td>
            <td class="text-right bold" style="font-size: 13px;">{{ number_format($slipGaji->pendapatan_bersih, 0, ',', '.') }}</td>
            <td style="border: none;" colspan="2"></td>
        </tr>
    </table>

    <div style="text-align: right; margin-top: 15px; margin-bottom: 5px; font-weight: bold;">
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
</body>
</html>
