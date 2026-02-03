<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Kwitansi Harian</title>
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
            margin-bottom: 20px;
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

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    @foreach ($groupedData as $projectData)
        <div class="container">
            <h2 style="text-align: center; text-decoration: underline; margin-top: 5px;">VOUCHER KAS KELUAR</h2>

            <table class="header-table">
                <tr>
                    <td class="label">Pay To</td>
                    <td>: {{ strtoupper($mandor->name) }}</td>
                    <td class="label">Date</td>
                    <td>: {{ \Carbon\Carbon::parse($date)->format('d M Y') }}</td>
                </tr>
                <tr>
                    <td class="label">Project</td>
                    <td colspan="3">: {{ $projectData['project_name'] }}</td>
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
                    @php $counter = 1; @endphp
                    @foreach ($projectData['items'] as $item)
                        <tr>
                            <td class="text-center">{{ $counter++ }}</td>
                            <td>{{ $item['expense_type'] }}</td>
                            <td>
                                <strong>{{ $item['name'] }}</strong>
                                <br>
                                <span style="font-size: 12px; color: #555;">(Qty: {{ $item['quantity'] }} x
                                    {{ number_format($item['price'], 0, ',', '.') }})</span>
                                @if (!empty($item['note']))
                                    <br>
                                    <span style="font-size: 11px; font-style: italic; color: #666;">Note:
                                        {{ $item['note'] }}</span>
                                @endif
                            </td>
                            <td class="text-right">
                                Rp {{ number_format($item['total_price'], 0, ',', '.') }}
                            </td>
                        </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="3" class="text-right">Total</td>
                        <td class="text-right">Rp {{ number_format($projectData['total_amount'], 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>

            <table class="footer-table">
                <tr>
                    <td>
                        <strong>Received by</strong>
                        <div class="signature-box"></div>
                        <div>( {{ strtoupper($mandor->name) }} )</div>
                    </td>
                    <td>
                        <strong>Finance</strong>
                        <div class="signature-box"></div>
                        <div>( .................................... )</div>
                    </td>
                </tr>
            </table>
        </div>

        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>

</html>
