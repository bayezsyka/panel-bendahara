<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Laporan Piutang - {{ $customer->name }}</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11px;
            color: #111;
            line-height: 1.4;
        }

        .kop {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .kop-table {
            width: 100%;
            border-collapse: collapse;
        }

        .company {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .judul {
            text-align: center;
            margin: 14px 0 12px 0;
        }

        .judul .h1 {
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 2px;
        }

        .info-box {
            width: 100%;
            margin: 10px 0 14px 0;
            border: 1px solid #000;
            border-collapse: collapse;
        }

        .info-box td {
            padding: 4px 6px;
            border: 1px solid #000;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
        }

        .data-table th {
            background-color: #f0f0f0;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
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

        .footer-note {
            margin-top: 15px;
            font-size: 9px;
            text-align: right;
            color: #777;
        }
    </style>
</head>

<body>
    {{-- KOP SURAT --}}
    <div class="kop">
        <table class="kop-table">
            <tr>
                <td style="width: 15%; text-align:center;">
                    <img src="{{ public_path('images/logo.png') }}" style="height: 60px;">
                </td>
                <td style="text-align: center;">
                    <div class="company">PT. JAYA KARYA KONTRUKSI</div>
                    <div style="font-size: 11px;">General Contractor & Supplier</div>
                </td>
                <td style="width: 15%;"></td>
            </tr>
        </table>
    </div>

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
                <th width="5%">No</th>
                <th width="12%">Tanggal</th>
                <th>Keterangan / Lokasi</th>
                <th width="8%">Mutu</th>
                <th width="10%">Vol (m³)</th>
                <th width="12%">Harga Satuan</th>
                <th width="12%">Tagihan</th>
                <th width="12%">Pembayaran</th>
                <th width="14%">Sisa Piutang</th>
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

    <div class="footer-note">
        Laporan ini dicetak secara otomatis pada sistem JKK Bendahara Panel.<br>
        Waktu cetak: {{ date('d F Y, H:i') }}
    </div>
</body>

</html>
