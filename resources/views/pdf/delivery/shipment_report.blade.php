<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11px;
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
            padding: 5px 6px;
            vertical-align: middle;
        }

        th {
            background-color: #efefef;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            font-size: 10px;
        }

        .summary-box {
            page-break-inside: avoid;
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 10px;
        }

        .footer-sig {
            width: 100%;
            margin-top: 30px;
        }

        .footer-sig td {
            text-align: center;
            width: 33%;
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

    <table class="table-data">
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="8%">Docket</th>
                <th width="10%">Tanggal</th>
                <th width="20%">Customer / Proyek</th>
                <th width="8%">Rit</th>
                <th width="8%">Mutu</th>
                <th width="12%">No. Mobil</th>
                <th width="12%">Driver</th>
                <th width="7%">Vol (m³)</th>
                <th width="12%">Total Harga (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($shipments as $index => $shipment)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center text-bold">{{ $shipment->docket_number }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($shipment->date)->format('d/m/Y') }}</td>
                    <td>
                        <strong>{{ $shipment->project->customer->name }}</strong><br>
                        <span style="font-size: 9px; color: #555;">{{ $shipment->project->name }}</span>
                    </td>
                    <td class="text-center">{{ $shipment->rit_number }}</td>
                    <td class="text-center text-bold">{{ $shipment->concreteGrade->code }}</td>
                    <td class="text-center">{{ $shipment->vehicle_number }}</td>
                    <td>{{ $shipment->driver_name }}</td>
                    <td class="text-right text-bold">{{ number_format($shipment->volume, 2, ',', '.') }}</td>
                    <td class="text-right text-bold">{{ number_format($shipment->total_price, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" class="text-center" style="font-style: italic; padding: 20px;">
                        Tidak ada data pengiriman dalam periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td colspan="8" class="text-right">TOTAL</td>
                <td class="text-right">{{ number_format($totalVolume, 2, ',', '.') }}</td>
                <td class="text-right">{{ number_format($totalAmount, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <table class="footer-sig">
        <tr>
            <td>
                Dibuat Oleh,<br><br><br><br>
                ( ________________ )<br>
                Admin Plant
            </td>
            <td></td>
            <td>
                Mengetahui,<br><br><br><br>
                ( ________________ )<br>
                Kepala Plant
            </td>
        </tr>
    </table>

</body>

</html>
