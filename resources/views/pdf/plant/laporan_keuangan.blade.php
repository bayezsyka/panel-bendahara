<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan Plant</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 10pt;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 16pt;
            text-transform: uppercase;
        }

        .header p {
            margin: 2px 0;
            color: #555;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 6px;
            vertical-align: top;
        }

        th {
            background-color: #f0f0f0;
            text-align: center;
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .text-red {
            color: #d32f2f;
        }

        .text-green {
            color: #2e7d32;
        }

        .balance-row {
            background-color: #fafafa;
            font-weight: bold;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 9pt;
        }

        .meta {
            margin-bottom: 15px;
            font-size: 9pt;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $reportTitle ?? 'Laporan Keuangan Kantor Plant' }}</h1>
        <p>{{ $periodText }}</p>
    </div>

    <div class="meta">
        <strong>Dicetak pada:</strong> {{ now()->translatedFormat('d F Y H:i') }} <br>
        <strong>Oleh:</strong> {{ auth()->user()->name }}
    </div>

    <table>
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

    <div class="footer">
        <p>Bendahara Kantor Plant</p>
        <br><br><br>
        <p>( {{ auth()->user()->name }} )</p>
    </div>
</body>

</html>
