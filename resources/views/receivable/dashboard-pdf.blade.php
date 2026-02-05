<!DOCTYPE html>
<html>

<head>
    <title>Laporan Piutang</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 4px 8px;
            vertical-align: middle;
        }

        th {
            background-color: #f2f2f2;
            text-align: center;
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>LAPORAN PIUTANG</h2>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%">NO</th>
                <th>KETERANGAN</th>
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
                    $bill = $customer->receivable_transactions_sum_bill_amount ?? 0;
                    $payment = $customer->receivable_transactions_sum_payment_amount ?? 0;
                    $balance = $bill - $payment;

                    $totalBill += $bill;
                    $totalPayment += $payment;
                    $totalBalance += $balance;
                @endphp
                <tr>
                    <td class="text-center">{{ $customer->id }}</td>
                    <td>{{ $customer->name }}</td>
                    <td class="text-right">
                        {{ $bill == 0 ? 'Rp-' : 'Rp' . number_format($bill, 0, ',', '.') }}
                    </td>
                    <td class="text-right">
                        {{ $payment == 0 ? 'Rp-' : 'Rp' . number_format($payment, 0, ',', '.') }}
                    </td>
                    <td class="text-right">
                        @if ($balance < 0)
                            -Rp{{ number_format(abs($balance), 0, ',', '.') }}
                        @elseif($balance == 0)
                            Rp-
                        @else
                            Rp{{ number_format($balance, 0, ',', '.') }}
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="font-bold" style="background-color: #f2f2f2;">
                <td colspan="2" class="text-center">TOTAL</td>
                <td class="text-right">
                    {{ $totalBill == 0 ? 'Rp-' : 'Rp' . number_format($totalBill, 0, ',', '.') }}
                </td>
                <td class="text-right">
                    {{ $totalPayment == 0 ? 'Rp-' : 'Rp' . number_format($totalPayment, 0, ',', '.') }}
                </td>
                <td class="text-right">
                    @if ($totalBalance < 0)
                        -Rp{{ number_format(abs($totalBalance), 0, ',', '.') }}
                    @elseif($totalBalance == 0)
                        Rp-
                    @else
                        Rp{{ number_format($totalBalance, 0, ',', '.') }}
                    @endif
                </td>
            </tr>
        </tfoot>
    </table>
</body>

</html>
