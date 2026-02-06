<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Laporan Piutang Global @if (($status ?? 'all') !== 'all')
            - {{ strtoupper($status) }}
        @endif
    </title>
    <style>
        @page {
            margin: 1cm 1cm 2cm 1cm;
        }

        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11px;
            color: #111;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }



        .judul {
            text-align: center;
            margin: 14px 0 12px 0;
            width: 100%;
            display: block;
        }

        .judul .h1 {
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 5px 8px;
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
    </style>
</head>

<body>
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <div class="judul">
        <div class="h1">LAPORAN PIUTANG GLOBAL</div>
        <div style="font-weight: bold; color: #666; font-size: 11px; margin-top: 5px;">
            STATUS:
            @if (($status ?? 'all') === 'all')
                SEMUA CUSTOMER
            @elseif($status === 'lunas')
                CUSTOMER LUNAS
            @elseif($status === 'belum_lunas')
                CUSTOMER BELUM LUNAS
            @endif
        </div>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%">NO</th>
                <th>KETERANGAN / NAMA CUSTOMER</th>
                <th style="width: 20%">JUMLAH TAGIHAN</th>
                <th style="width: 20%">TOTAL PEMBAYARAN</th>
                <th style="width: 20%">SISA PIUTANG</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalBill = 0;
                $totalPayment = 0;
                $totalBalance = 0;
            @endphp
            @foreach ($customers as $customer)
                @php
                    $bill = (float) ($customer->receivable_transactions_sum_bill_amount ?? 0);
                    $payment = (float) ($customer->receivable_transactions_sum_payment_amount ?? 0);
                    $balance = $bill - $payment;

                    $totalBill += $bill;
                    $totalPayment += $payment;
                    $totalBalance += $balance;
                @endphp
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td>
                        <div class="text-bold">{{ $customer->name }}</div>
                        @if ($customer->address)
                            <div style="font-size: 9px; color: #666; margin-top: 2px;">{{ $customer->address }}</div>
                        @endif
                    </td>
                    <td class="text-right">
                        {{ $bill == 0 ? '-' : number_format($bill, 0, ',', '.') }}
                    </td>
                    <td class="text-right">
                        {{ $payment == 0 ? '-' : number_format($payment, 0, ',', '.') }}
                    </td>
                    <td class="text-right text-bold">
                        @if ($balance < 0)
                            ({{ number_format(abs($balance), 0, ',', '.') }})
                        @elseif($balance == 0)
                            -
                        @else
                            {{ number_format($balance, 0, ',', '.') }}
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="text-bold" style="background-color: #f0f0f0;">
                <td colspan="2" class="text-center">TOTAL KESELURUHAN</td>
                <td class="text-right">
                    {{ number_format($totalBill, 0, ',', '.') }}
                </td>
                <td class="text-right">
                    {{ number_format($totalPayment, 0, ',', '.') }}
                </td>
                <td class="text-right">
                    @if ($totalBalance < 0)
                        ({{ number_format(abs($totalBalance), 0, ',', '.') }})
                    @elseif($totalBalance == 0)
                        -
                    @else
                        {{ number_format($totalBalance, 0, ',', '.') }}
                    @endif
                </td>
            </tr>
        </tfoot>
    </table>


</body>

</html>
