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
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .header-info td {
            padding: 2px 0;
            vertical-align: top;
        }

        .header-info td:first-child {
            width: 200px;
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

    <div class="text-center" style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 5px; text-decoration: underline; text-transform: uppercase;">REKAPITULASI TIKET BUKTI
            KIRIM</h3>
    </div>

    <table class="header-info">
        <tr>
            <td class="font-bold">Nama Klien</td>
            <td>: {{ $project->customer->name }}</td>
        </tr>
        <tr>
            <td class="font-bold">Alamat Klien</td>
            <td>: {{ $project->customer->address }}</td>
        </tr>
        <tr>
            <td class="font-bold">Nama Penerima / Sub Contractor</td>
            <td>: {{ $project->sub_contractor ?? '-' }}</td>
        </tr>
        <tr>
            <td class="font-bold">Alamat Proyek</td>
            <td>: {{ $project->location }}</td>
        </tr>
        <tr>
            <td class="font-bold">Periode</td>
            <td>: {{ $period }}</td>
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

    <div class="sign-section">
        <div class="sign-box">
            Pekalongan, {{ now()->translatedFormat('d F Y') }}<br>
            Hormat Kami,<br>
            <br><br><br><br>
            ( ____________________ )
        </div>
        <div style="clear: both;"></div>
    </div>
</body>

</html>
