<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Kwitansi #{{ $expense->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #333;
            padding: 20px;
        }

        .container {
            border: 2px solid #333;
            padding: 10px;
            position: relative;
        }

        .header-table {
            width: 100%;
            margin-bottom: 20px;
        }

        .header-table td {
            padding: 3px;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
            width: 120px;
        }

        .content-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .content-table th,
        .content-table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }

        .content-table th {
            text-align: center;
            background-color: #f0f0f0;
        }

        .total-row td {
            font-weight: bold;
        }

        .footer-table {
            width: 100%;
            margin-top: 30px;
            border-collapse: collapse;
        }

        .footer-table td {
            border: 1px solid #333;
            padding: 10px;
            text-align: center;
            width: 50%;
            vertical-align: top;
        }

        .signature-box {
            height: 80px;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .no-border {
            border: none !important;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2 style="text-align: center; text-decoration: underline; margin-top: 5px;">KWITANSI</h2>

        <table class="header-table">
            <tr>
                <td class="label">Pay To</td>
                <td>: {{ strtoupper($payTo) }}</td>
                <td class="label">Date</td>
                <td>: {{ $expense->transacted_at->format('d M Y') }}</td>
            </tr>
            <tr>
                <td class="label">Project</td>
                <td>: {{ $expense->project->name }}</td>
                <td class="label">No</td>
                <td>: {{ sprintf('EXP-%06d', $expense->id) }}</td>
            </tr>
            <tr>
                <td class="label">Title</td>
                <td>: {{ $expense->title }}</td>
                <td></td>
                <td></td>
            </tr>
        </table>

        <table class="content-table">
            <thead>
                <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 25%">Tipe Biaya</th>
                    <th style="width: 45%">Item Pembelian</th>
                    <th style="width: 25%">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($expense->items as $index => $item)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $expense->expenseType->name ?? '-' }}</td>
                        <td>
                            <strong>{{ $item->name }}</strong>
                            @if ($item->quantity > 1)
                                <br>
                                <span style="font-size: 12px; color: #555;">(Qty: {{ $item->quantity }} x
                                    {{ number_format($item->price, 0, ',', '.') }})</span>
                            @endif
                            @if ($expense->description && $index === 0)
                                <br>
                                <span style="font-size: 11px; font-style: italic; color: #666;">Note:
                                    {{ $expense->description }}</span>
                            @endif
                        </td>
                        <td class="text-right">
                            Rp {{ number_format($item->total_price, 0, ',', '.') }}
                        </td>
                    </tr>
                @endforeach
                <!-- Fill empty rows if needed to look like the image, but simplicity is better -->
                <tr class="total-row">
                    <td colspan="3" class="text-right">Total</td>
                    <td class="text-right">Rp {{ number_format($expense->amount, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <table class="footer-table">
            <tr>
                <td>
                    <strong>Pelaksana</strong>
                    <div class="signature-box"></div>
                    <div>( {{ strtoupper($payTo) }} )</div>
                </td>
                <td>
                    <strong>Admin / Bendahara</strong>
                    <div class="signature-box"></div>
                    <div>( .................................... )</div>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
