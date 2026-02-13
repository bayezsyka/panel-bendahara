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
    </style>
</head>

<body>
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <div class="judul">
        <div class="h1">{{ $title }}</div>
        <div class="sub">{{ $periodText }}</div>
    </div>

    <!-- I. PEMASUKAN -->
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
            <!-- Saldo Awal Row -->
            <tr class="bg-green-light">
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-bold">Saldo Awal</td>
                <td class="text-center">-</td>
                <td class="text-right text-bold">{{ number_format($initialBalance, 0, ',', '.') }}</td>
            </tr>

            @foreach ($incomes as $index => $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->transaction_date)->format('d-M-y') }}</td>
                    <td>{{ $item->description }}</td>
                    <td>{{ $item->cashSource->name ?? '-' }}</td>
                    <td class="text-right">{{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
            @endforeach

            <!-- Subtotal In -->
            <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td colspan="4" class="text-right">TOTAL TERSEDIA</td>
                <td class="text-right">{{ number_format($totalIncomeDisplay, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- II. PENGELUARAN -->
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
            @forelse($expenses as $index => $item)
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

            <!-- Subtotal Out -->
            <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td colspan="4" class="text-right">TOTAL PENGELUARAN</td>
                <td class="text-right text-red">{{ number_format($totalOutRaw, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- III. SUMMARY -->
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

</body>

</html>
