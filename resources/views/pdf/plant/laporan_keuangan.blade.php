<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan Plant</title>
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

        .text-green {
            color: #2e7d32;
        }

        .text-red {
            color: #d32f2f;
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

        table.table-data {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table.table-data th,
        table.table-data td {
            border: 1px solid #000;
            padding: 6px 8px;
            vertical-align: top;
        }

        table.table-data th {
            background-color: #efefef;
            text-align: center;
            font-weight: bold;
        }

        .balance-row {
            background-color: #fafafa;
            font-weight: bold;
        }

        .footer-sign {
            margin-top: 30px;
            text-align: right;
            font-size: 11px;
        }

        .meta {
            margin-bottom: 15px;
            font-size: 11px;
            color: #666;
        }
    </style>
</head>

<body>
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <div class="judul">
        <div class="h1">{{ $reportTitle ?? 'Laporan Keuangan Kantor Plant' }}</div>
        <div class="sub">{{ $periodText }}</div>
    </div>

    <div class="meta">
        Dicetak pada: {{ now()->translatedFormat('d F Y H:i') }} <br>
        Oleh: {{ auth()->user()->name }}
    </div>

    <table class="table-data">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="12%">Tanggal</th>
                <th width="35%">Keterangan</th>
                <th width="15%">Tipe</th>
                <th width="13%">Kas Masuk</th>
                <th width="13%">Kas Keluar</th>
                <th width="13%">Saldo</th>
            </tr>
        </thead>
        <tbody>
            {{-- Saldo Awal Row --}}
            <tr class="balance-row">
                <td colspan="4" class="text-right">Saldo Awal</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right">{{ number_format($initialBalance, 0, ',', '.') }}</td>
            </tr>

            @php
                $currentBalance = $initialBalance;
                $totalIn = 0;
                $totalOut = 0;
            @endphp

            @foreach ($transactions as $index => $trx)
                @php
                    if ($trx->type == 'in') {
                        $currentBalance += $trx->amount;
                        $totalIn += $trx->amount;
                    } else {
                        $currentBalance -= $trx->amount;
                        $totalOut += $trx->amount;
                    }
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($trx->transaction_date)->format('d-M-y') }}</td>
                    <td>{{ $trx->description }}</td>
                    <td class="text-center">{{ $trx->expenseType->name ?? '-' }}</td>
                    <td class="text-right text-green">
                        {{ $trx->type == 'in' ? number_format($trx->amount, 0, ',', '.') : '' }}
                    </td>
                    <td class="text-right text-red">
                        {{ $trx->type == 'out' ? number_format($trx->amount, 0, ',', '.') : '' }}
                    </td>
                    <td class="text-right">
                        {{ number_format($currentBalance, 0, ',', '.') }}
                    </td>
                </tr>
            @endforeach

            {{-- Footer Totals --}}
            <tr class="balance-row">
                <td colspan="4" class="text-right">Total Pergerakan</td>
                <td class="text-right text-green">{{ number_format($totalIn, 0, ',', '.') }}</td>
                <td class="text-right text-red">{{ number_format($totalOut, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($currentBalance, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer-sign">
        <p>Bendahara Kantor Plant</p>
        <br><br><br>
        <p>( {{ auth()->user()->name }} )</p>
    </div>
</body>

</html>
