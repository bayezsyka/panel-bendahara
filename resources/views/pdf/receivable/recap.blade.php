<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Piutang Gabungan</title>
    <style>
        @page {
            margin: 1cm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            color: #1f2937;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
        }

        .header p {
            margin: 5px 0 0;
            font-size: 10pt;
        }

        .customer-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }

        .subsidiary-header {
            font-weight: bold;
            display: flex;
            margin-bottom: 5px;
        }

        .subsidiary-label {
            width: 120px;
            display: inline-block;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
        }

        th,
        td {
            border: 1px solid #e5e7eb;
            padding: 4px 6px;
            vertical-align: middle;
        }

        th {
            background-color: #f3f4f6;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-bold {
            font-weight: bold;
        }

        .bg-gray {
            background-color: #f9fafb;
        }

        /* Specific column widths matching the visual key */
        .col-date {
            width: 70px;
        }

        .col-project {
            width: 150px;
        }

        .col-grade {
            width: 50px;
        }

        .col-price {
            width: 60px;
        }

        .col-vol {
            width: 40px;
        }

        .col-amt {
            width: 75px;
        }

        .totals-row td {
            font-weight: bold;
            background-color: #f3f4f6;
            border-top: 2px solid #d1d5db;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Laporan Kartu Piutang Gabungan</h1>
        <p>Periode: {{ $period }} | Dicetak: {{ $date_printed }}</p>
    </div>

    @foreach ($reports as $report)
        <div class="customer-section">
            <div class="subsidiary-header">
                <span class="subsidiary-label">SUBSIDIARY :</span>
                <span>{{ $report['customer_name'] }}</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 25px;">No</th>
                        <th rowspan="2" class="col-date">Tanggal</th>
                        <th rowspan="2" class="col-project">Customer (Proyek)</th>
                        <th rowspan="2" class="col-grade">Mutu</th>
                        <th rowspan="2" class="col-price">Harga m3</th>
                        <th colspan="2" class="text-center">Volume</th>
                        <th colspan="2" class="text-center">Tagihan</th>
                        <th colspan="3" class="text-center">Pembayaran</th>
                        <th rowspan="2">KET</th>
                    </tr>
                    <tr>
                        <th class="col-vol">Vol</th>
                        <th class="col-vol">Total Vol</th>
                        <th class="col-amt">Tagihan</th>
                        <th class="col-amt">Total Tagihan</th>
                        <th class="col-date">Tanggal</th>
                        <th class="col-amt">Pembayaran</th>
                        <th class="col-amt">Saldo Akhir</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($report['ledger'] as $index => $item)
                        <tr class="{{ $loop->even ? 'bg-gray' : '' }}">
                            <td class="text-center">{{ $loop->iteration }}</td>

                            @if ($item['type'] === 'shipment')
                                <td class="text-center">{{ $item['date']->format('d-M-y') }}</td>
                                <td>{{ $item['project_name'] }}</td>
                                <td class="text-center">{{ $item['concrete_grade'] }}</td>
                                <td class="text-right">{{ number_format($item['price_per_m3'], 0, ',', '.') }}</td>
                                <td class="text-center">{{ number_format($item['volume'], 1, ',', '.') }}</td>
                                <td class="text-center text-bold">
                                    {{ number_format($item['running_volume'], 1, ',', '.') }}</td>
                                <td class="text-right">{{ number_format($item['debit'], 0, ',', '.') }}</td>
                                <td class="text-right text-bold">
                                    {{ number_format($item['running_tagihan'], 0, ',', '.') }}</td>
                                <td></td> <!-- Payment Date -->
                                <td></td> <!-- Payment Amount -->
                            @else
                                <td></td> <!-- Shipment Date -->
                                <td></td> <!-- Project -->
                                <td></td> <!-- Grade -->
                                <td></td> <!-- Price -->
                                <td></td> <!-- Vol -->
                                <td></td> <!-- Total Vol -->
                                <td></td> <!-- Tagihan -->
                                <td></td> <!-- Total Tagihan -->
                                <td class="text-center">{{ $item['date']->format('d-M-y') }}</td>
                                <td class="text-right text-bold">{{ number_format($item['credit'], 0, ',', '.') }}</td>
                            @endif

                            <td class="text-right text-bold">{{ number_format($item['balance'], 0, ',', '.') }}</td>
                            <td style="font-size: 7pt;">{{ $item['description'] }}</td>
                        </tr>
                    @endforeach

                    <!-- Summary Row -->
                    <tr class="totals-row">
                        <td colspan="5" class="text-right">TOTAL</td>
                        <td class="text-center">{{ number_format($report['summary']['total_volume'], 1, ',', '.') }}
                        </td>
                        <td class="text-center">{{ number_format($report['summary']['total_volume'], 1, ',', '.') }}
                        </td>
                        <td class="text-right">{{ number_format($report['summary']['total_tagihan'], 0, ',', '.') }}
                        </td>
                        <td class="text-right">{{ number_format($report['summary']['total_tagihan'], 0, ',', '.') }}
                        </td>
                        <td></td>
                        <td class="text-right">{{ number_format($report['summary']['total_payment'], 0, ',', '.') }}
                        </td>
                        <td class="text-right">{{ number_format($report['summary']['final_balance'], 0, ',', '.') }}
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endforeach

</body>

</html>
