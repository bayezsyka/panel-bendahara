<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: #111;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .text-bold {
            font-weight: bold;
        }

        .judul {
            text-align: left;
            margin: 10px 0 20px 0;
            width: 100%;
            display: block;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        .judul .h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 4px 0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .judul .sub {
            font-size: 13px;
            margin: 0;
            color: #444;
        }

        .table-data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .table-data th,
        .table-data td {
            border: 1px solid #000;
            padding: 6px 8px;
            vertical-align: top;
        }

        th {
            background-color: #efefef;
            font-weight: bold;
            text-align: center;
        }

        .bg-green-light {
            background-color: #e8f5e9;
        }

        .text-red {
            color: #d32f2f;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            margin-top: 15px;
            text-decoration: underline;
        }

        .summary-box {
            page-break-inside: avoid;
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 10px;
        }

        /* =====================================================
         * TANDA TANGAN - mPDF support inline-block dengan benar
         * ===================================================== */
        .signature-box {
            margin-top: 40px;
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

        .signature-table.three-cols td {
            width: 33.33%;
        }

        .td-label {
            padding: 8px 5px;
            font-style: italic;
        }

        .td-space {
            height: 100px;
        }

        .td-name {
            padding: 6px 10px 5px 5px;
            text-align: center;
        }

        /* mPDF support inline-block dengan baik — nama & jabatan lurus */
        .sign-name-block {
            display: inline-block;
            text-align: left;
        }

        .sign-name-block .nama {
            font-weight: bold;
            font-size: 12px;
            display: block;
        }

        .sign-name-block .jabatan {
            font-weight: bold;
            font-size: 11px;
            display: block;
            margin-top: 3px;
        }
    </style>
</head>

<body>
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <div class="judul">
        <div class="h1">{{ $title }}</div>
        <div class="sub">{{ $periodText }}</div>
    </div>

    <div class="section-title">I. PEMASUKAN</div>
    <table class="table-data">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="15%">Tanggal</th>
                <th width="35%">Keterangan</th>
                <th width="20%">Sumber</th>
                <th width="25%">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <tr class="bg-green-light">
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-bold">Saldo Awal</td>
                <td class="text-center">-</td>
                <td class="text-right text-bold">{{ number_format($initialBalance, 0, ',', '.') }}</td>
            </tr>

            @foreach ($incomes as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->transaction_date)->format('d-M-y') }}</td>
                    <td>{{ $item->description }}</td>
                    <td>{{ $item->cashSource->name ?? '-' }}</td>
                    <td class="text-right">{{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
            @endforeach

            <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td colspan="4" class="text-right">TOTAL TERSEDIA</td>
                <td class="text-right">{{ number_format($totalIncomeDisplay, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">II. PENGELUARAN</div>
    <table class="table-data">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="15%">Tanggal</th>
                <th width="35%">Keterangan</th>
                <th width="20%">Tipe Biaya</th>
                <th width="25%">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expenses as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->transaction_date)->format('d-M-y') }}</td>
                    <td>{{ $item->description }}</td>
                    <td>{{ $item->cashExpenseType->name ?? '-' }}</td>
                    <td class="text-right text-red">{{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="font-style: italic; color: #777;">Tidak ada
                        pengeluaran</td>
                </tr>
            @endforelse

            <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td colspan="4" class="text-right">TOTAL PENGELUARAN</td>
                <td class="text-right text-red">{{ number_format($totalOutRaw, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="summary-box">
        <table style="width: 100%; border: none; margin: 0;">
            <tr style="border: none;">
                <td style="border: none; text-align: right; width: 75%; padding-right: 15px; font-size: 11pt;">
                    <strong>SISA SALDO AKHIR:</strong>
                </td>
                <td
                    style="border: 1px solid #000; text-align: right; font-size: 12pt; font-weight: bold; background-color: #fff3e0;">
                    Rp {{ number_format($finalBalance, 0, ',', '.') }}
                </td>
            </tr>
        </table>
    </div>

    <div class="signature-box">
        <table class="signature-table {{ $cashType === 'kas_kecil' ? 'three-cols' : '' }}">
            <tr>
                <td class="td-label">Mengetahui,</td>
                @if($cashType === 'kas_kecil')
                    <td class="td-label">Verifikasi,</td>
                @endif
                <td class="td-label">Dibuat,</td>
            </tr>
            <tr>
                <td class="td-space"></td>
                @if($cashType === 'kas_kecil')
                    <td class="td-space"></td>
                @endif
                <td class="td-space"></td>
            </tr>
            <tr>
                <td class="td-name">
                    <div class="sign-name-block">
                        <div class="nama"><strong>Mashuri</strong></div>
                        <div class="jabatan"><strong>Kepala Plant</strong></div>
                    </div>
                </td>
                @if($cashType === 'kas_kecil')
                    <td class="td-name">
                        <div class="sign-name-block">
                            <div class="nama"><strong>Mas Adib</strong></div>
                            <div class="jabatan"><strong>Keuangan</strong></div>
                        </div>
                    </td>
                    <td class="td-name">
                        <div class="sign-name-block">
                            <div class="nama"><strong>M. Amin</strong></div>
                            <div class="jabatan"><strong>Administrasi Keuangan</strong></div>
                        </div>
                    </td>
                @else
                    <td class="td-name">
                        <div class="sign-name-block">
                            <div class="nama"><strong>Mas Adib</strong></div>
                            <div class="jabatan"><strong>Keuangan</strong></div>
                        </div>
                    </td>
                @endif
            </tr>
        </table>
    </div>

</body>

</html>
