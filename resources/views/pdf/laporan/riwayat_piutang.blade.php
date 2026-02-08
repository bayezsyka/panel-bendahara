<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Laporan Piutang - {{ $customer->name }}</title>
    <style>
        @page {
            margin: 1.5cm 1cm 2cm 1cm;
        }

        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 10px;
            color: #111;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }

        .judul {
            text-align: center;
            margin-bottom: 20px;
            width: 100%;
        }

        .judul .h1 {
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 3px;
        }

        .info-box {
            width: 100%;
            margin-bottom: 15px;
            border: 1px solid #000;
            border-collapse: collapse;
        }

        .info-box td {
            padding: 5px 8px;
            border: 1px solid #000;
            vertical-align: top;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 5px 6px;
            vertical-align: top;
            word-wrap: break-word;
        }

        .data-table th {
            background-color: #f2f2f2;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
        }

        /* Portrait Column Widths */
        .col-no {
            width: 3%;
        }

        .col-date {
            width: 10%;
        }

        .col-desc {
            width: 18%;
        }

        .col-mutu {
            width: 7%;
        }

        .col-vol {
            width: 7%;
        }

        .col-harga {
            width: 12%;
        }

        .col-tagihan {
            width: 13%;
        }

        .col-bayar {
            width: 13%;
        }

        .col-sisa {
            width: 15%;
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

        tr {
            page-break-inside: avoid;
        }
    </style>
</head>

<body>
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <div class="judul">
        <div class="h1">LAPORAN RINCIAN PIUTANG CUSTOMER</div>
        <div style="font-weight: bold; font-size: 12px; margin-top: 5px;">{{ strtoupper($customer->name) }}</div>
    </div>

    {{-- INFO CUSTOMER --}}
    <table class="info-box">
        <tr>
            <td width="15%" class="text-bold">Nama</td>
            <td width="35%">{{ $customer->name }}</td>
            <td width="15%" class="text-bold">Kontak</td>
            <td>{{ $customer->contact ?? '-' }}</td>
        </tr>
        <tr>
            <td class="text-bold">Alamat</td>
            <td>{{ $customer->address ?? '-' }}</td>
            <td class="text-bold">Keterangan</td>
            <td>{{ $customer->description ?? '-' }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th class="col-no">No</th>
                <th class="col-date">Tanggal</th>
                <th class="col-desc">Keterangan / Lokasi</th>
                <th class="col-mutu">Mutu</th>
                <th class="col-vol">Vol (m³)</th>
                <th class="col-harga">Harga Satuan</th>
                <th class="col-tagihan">Tagihan</th>
                <th class="col-bayar">Pembayaran</th>
                <th class="col-sisa">Sisa Piutang</th>
            </tr>
        </thead>
        <tbody>
            @php
                $runningBalance = 0;
                $totalBill = 0;
                $totalPayment = 0;
                $totalVolume = 0;
            @endphp

            @foreach ($transactions as $trx)
                @php
                    $bill = (float) $trx->bill_amount;
                    $payment = (float) $trx->payment_amount;
                    $runningBalance = $runningBalance + $bill - $payment;

                    $totalBill += $bill;
                    $totalPayment += $payment;
                    $totalVolume += (float) $trx->volume;

                    // Format balance display with parentheses for overpayment (negative balance)
                    $displayBalance =
                        $runningBalance < 0
                            ? '(' . number_format(abs($runningBalance), 0, ',', '.') . ')'
                            : number_format($runningBalance, 0, ',', '.');
                @endphp
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($trx->date)->format('d/m/Y') }}</td>
                    <td>
                        {{ $trx->description }}
                        @if ($trx->notes)
                            <div style="font-size: 9px; color: #555; font-style: italic;">Note: {{ $trx->notes }}
                            </div>
                        @endif
                    </td>
                    <td class="text-center">{{ $trx->grade ?? '-' }}</td>
                    <td class="text-right">{{ $trx->volume ? number_format($trx->volume, 2, ',', '.') : '-' }}</td>
                    <td class="text-right">
                        {{ $trx->price_per_m3 ? number_format($trx->price_per_m3, 0, ',', '.') : '-' }}</td>
                    <td class="text-right">{{ $bill > 0 ? number_format($bill, 0, ',', '.') : '-' }}</td>
                    <td class="text-right">{{ $payment > 0 ? number_format($payment, 0, ',', '.') : '-' }}</td>
                    <td class="text-right text-bold">{{ $displayBalance }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td colspan="4" class="text-right">TOTAL</td>
                <td class="text-right">{{ number_format($totalVolume, 2, ',', '.') }}</td>
                <td></td>
                <td class="text-right">{{ number_format($totalBill, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totalPayment, 0, ',', '.') }}</td>
                <td class="text-right">
                    @php
                        $finalBalanceDisplay =
                            $runningBalance < 0
                                ? '(' . number_format(abs($runningBalance), 0, ',', '.') . ')'
                                : number_format($runningBalance, 0, ',', '.');
                    @endphp
                    {{ $finalBalanceDisplay }}
                </td>
            </tr>
        </tfoot>
    </table>


</body>

</html>
