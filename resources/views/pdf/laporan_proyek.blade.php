<!DOCTYPE html>
<html>

<head>
    <title>Laporan Keuangan Proyek</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }

        .header p {
            margin: 2px 0;
        }

        .meta {
            margin-bottom: 20px;
        }

        .meta table {
            width: 100%;
            border: none;
        }

        .meta td {
            padding: 2px;
            vertical-align: top;
        }

        .content table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .content th,
        .content td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
        }

        .content th {
            background-color: #f0f0f0;
        }

        .text-right {
            text-align: right;
        }

        .footer {
            margin-top: 40px;
            text-align: right;
        }

        .ttd {
            margin-top: 60px;
            font-weight: bold;
            text-decoration: underline;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>PT. JAYA KARYA KONTRUKSI</h1>
        <p>Jl. Jendral Sudirman No. 123, Jakarta Selatan</p>
        <p>Telp: (021) 12345678 | Email: admin@konstruksi.id</p>
    </div>

    <div class="meta">
        <p><strong>Perihal: Laporan Pengeluaran Proyek</strong></p>
        <table>
            <tr>
                <td width="15%">Nama Proyek</td>
                <td width="2%">:</td>
                <td>{{ $project->name }}</td>
            </tr>
            <tr>
                <td>Periode</td>
                <td>:</td>
                <td>{{ $periode }}</td>
            </tr>
        </table>
    </div>

    <div class="content">
        <table>
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th width="15%">Tanggal</th>
                    <th>Keterangan / Item</th>
                    <th width="15%">Bukti</th>
                    <th width="20%" class="text-right">Nominal (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @forelse($expenses as $index => $expense)
                    <tr>
                        <td style="text-align: center;">{{ $index + 1 }}</td>
                        <td>{{ $expense->transacted_at->format('d/m/Y') }}</td>
                        <td>
                            <strong>{{ $expense->title }}</strong><br>
                            <small>{{ $expense->description }}</small>
                        </td>
                        <td style="text-align: center;">
                            {{ $expense->receipt_image ? 'Terlampir' : '-' }}
                        </td>
                        <td class="text-right">{{ number_format($expense->amount, 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center;">Tidak ada pengeluaran pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="4" class="text-right">TOTAL PENGELUARAN</th>
                    <th class="text-right">{{ number_format($expenses->sum('amount'), 0, ',', '.') }}</th>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="footer">
        <p>Jakarta, {{ now()->translatedFormat('d F Y') }}</p>
        <p>Dibuat oleh,</p>
        <div class="ttd">{{ auth()->user()->name }}</div>
        <div>Bendahara Proyek</div>
    </div>

</body>

</html>
