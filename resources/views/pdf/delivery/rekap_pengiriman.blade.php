<!DOCTYPE html>
<html>

<head>
    <title>Rekapitulasi Tiket Bukti Kirim</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10pt;
            margin: 0;
            padding: 0;
            color: #333;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: bold;
        }

        .header-info {
            width: 100%;
            margin-bottom: 10px;
            border-collapse: collapse;
        }

        .header-info td {
            padding: 2px 0;
            vertical-align: top;
        }

        .header-info .info-label {
            width: 200px;
            font-weight: bold;
        }

        .header-info .info-separator {
            width: 12px;
            text-align: center;
        }

        .header-info .info-value {
            word-break: break-word;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table.data-table th,
        table.data-table td {
            border: 1px solid #000;
            padding: 6px 4px;
            font-size: 9pt;
            word-wrap: break-word;
        }

        table.data-table th {
            background-color: #f2f2f2;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }

        .footer-volume {
            background-color: #f9f9f9;
            font-weight: bold;
        }

        .sign-section {
            margin-top: 30px;
            width: 100%;
        }

        .sign-box {
            float: right;
            width: 250px;
            text-align: center;
        }
    </style>
</head>

<body>
    @include('pdf.komponen.header')

    <div class="text-center" style="margin-bottom: 10px;">
        <h3 style="margin-bottom: 5px; text-decoration: underline; text-transform: uppercase;">REKAPITULASI TIKET BUKTI
            KIRIM</h3>
    </div>

    <table class="header-info">
        <tr>
            <td class="info-label">Nama Klien</td>
            <td class="info-separator">:</td>
            <td class="info-value">{{ $project->customer->name }}</td>
        </tr>
        <tr>
            <td class="info-label">Alamat Klien</td>
            <td class="info-separator">:</td>
            <td class="info-value">{{ $project->customer->address }}</td>
        </tr>
        <tr>
            <td class="info-label">Nama Penerima / Sub Contractor</td>
            <td class="info-separator">:</td>
            <td class="info-value">{{ $project->sub_contractor ?? '-' }}</td>
        </tr>
        <tr>
            <td class="info-label">Alamat Proyek</td>
            <td class="info-separator">:</td>
            <td class="info-value">{{ $project->location }}</td>
        </tr>
        <tr>
            <td class="info-label">Periode</td>
            <td class="info-separator">:</td>
            <td class="info-value">{{ $period }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th width="4%">NO</th>
                <th width="10%">TANGGAL</th>
                <th width="12%">DN (TICKET)</th>
                <th width="6%">RIT</th>
                <th width="10%">MUTU BETON</th>
                <th width="10%">SLUMP</th>
                <th width="12%">VOL (M3)</th>
                <th width="12%">NO. POLISI</th>
                <th>SUPIR</th>
            </tr>
        </thead>
        <tbody>
            @php $totalVolume = 0; @endphp
            @foreach ($shipments as $index => $shipment)
                @php $totalVolume += (float)$shipment->volume; @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($shipment->date)->format('d/m/Y') }}</td>
                    <td class="text-center font-bold">{{ $shipment->docket_number }}</td>
                    <td class="text-center">{{ $shipment->rit_number }}</td>
                    <td class="text-center italic">{{ $shipment->concreteGrade->code }}</td>
                    <td class="text-center">{{ $shipment->slump ?? '-' }}</td>
                    <td class="text-right font-bold">{{ number_format($shipment->volume, 2) }}</td>
                    <td class="text-center uppercase">{{ $shipment->vehicle_number ?? '-' }}</td>
                    <td>{{ $shipment->driver_name ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="footer-volume">
                <td colspan="6" class="text-right">TOTAL VOLUME</td>
                <td class="text-right">{{ number_format($totalVolume, 2) }} M3</td>
                <td colspan="2"></td>
            </tr>
        </tfoot>
    </table>

</body>

</html>
