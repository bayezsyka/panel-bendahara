<!DOCTYPE html>
<html>

<head>
    <title>Laporan Keseluruhan Proyek</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 16px;
            text-transform: uppercase;
        }

        .project-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }

        .project-title {
            font-size: 14px;
            font-weight: bold;
            background-color: #e5e7eb;
            padding: 8px;
            margin-bottom: 10px;
        }

        .meta-table {
            width: 100%;
            margin-bottom: 10px;
        }

        .meta-table td {
            padding: 2px;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table.data th,
        table.data td {
            border: 1px solid #ccc;
            padding: 4px;
        }

        table.data th {
            background-color: #f9fafb;
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .badge-price {
            background-color: #eee;
            padding: 1px 4px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 10px;
        }

        .page-break {
            page-break-after: always;
        }

        /* Styles untuk Grid Nota */
        .receipt-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }

        .receipt-item {
            display: inline-block;
            width: 30%;
            margin-bottom: 20px;
            vertical-align: top;
            border: 1px solid #ddd;
            padding: 8px;
            background-color: #fff;
        }

        .receipt-img {
            width: 100%;
            height: auto;
            max-height: 200px;
            object-fit: contain;
            border: 1px solid #eee;
            margin: 5px 0;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>Laporan Keseluruhan Proyek</h1>
        <p>PT. JAYA KARYA KONTRUKSI</p>
        <p>Dicetak pada: {{ $generatedAt }}</p>
    </div>

    @foreach ($projects as $project)
        <div class="project-section">
            <div class="project-title">{{ $project['name'] }}
                ({{ $project['status'] == 'ongoing' ? 'Berjalan' : 'Selesai' }})</div>

            <table class="meta-table">
                <tr>
                    <td width="15%">Durasi</td>
                    <td width="2%">:</td>
                    <td>{{ $project['start_date'] }} s/d {{ $project['end_date'] }} ({{ $project['duration'] }})</td>
                </tr>
                <tr>
                    <td>Total Pengeluaran</td>
                    <td>:</td>
                    <td><strong>Rp {{ number_format($project['total_expense'], 0, ',', '.') }}</strong></td>
                </tr>
            </table>

            <h4>Rincian Pengeluaran:</h4>
            <table class="data">
                <thead>
                    <tr>
                        <th width="30%">Periode (Minggu/Hari)</th>
                        <th>Rincian Item & Harga Satuan</th>
                        <th width="20%" class="text-right">Total (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($project['weekly_expenses'] as $weekKey => $weekItems)
                        @php
                            [$weekNum, $year] = explode('-', $weekKey);
                            $dto = new DateTime();
                            $dto->setISODate($year, $weekNum);
                            $weekStart = $dto->format('d/m/Y');
                            $weekEnd = $dto->modify('+6 days')->format('d/m/Y');
                        @endphp
                        {{-- Header Mingguan --}}
                        <tr style="background-color: #eff6ff;">
                            <td colspan="2"><strong>Minggu ke-{{ $weekNum }} ({{ $weekStart }} -
                                    {{ $weekEnd }})</strong></td>
                            <td class="text-right">
                                <strong>{{ number_format($weekItems->sum('amount'), 0, ',', '.') }}</strong></td>
                        </tr>

                        {{-- Breakdown Harian --}}
                        @foreach ($weekItems->groupBy(fn($i) => $i->transacted_at->format('Y-m-d')) as $dateKey => $dayItems)
                            <tr>
                                <td style="padding-left: 20px; vertical-align: top;">
                                    {{ \Carbon\Carbon::parse($dateKey)->format('d F Y') }}
                                </td>
                                <td style="vertical-align: top;">
                                    <ul style="margin: 0; padding-left: 15px;">
                                        @foreach ($dayItems as $item)
                                            <li style="margin-bottom: 4px;">
                                                <span>{{ $item->title }}</span>
                                                {{-- UPDATE DISINI: Menampilkan Harga Per Item --}}
                                                <span class="badge-price">Rp
                                                    {{ number_format($item->amount, 0, ',', '.') }}</span>

                                                @if ($item->description)
                                                    <br><small style="color: #666;"> - {{ $item->description }}</small>
                                                @endif

                                                @if ($withReceipts && $item->receipt_image)
                                                    <br><small style="color: blue;"><i>(Lihat Lampiran Nota)</i></small>
                                                @endif
                                            </li>
                                        @endforeach
                                    </ul>
                                </td>
                                <td class="text-right" style="vertical-align: top; font-weight: bold;">
                                    {{ number_format($dayItems->sum('amount'), 0, ',', '.') }}
                                </td>
                            </tr>
                        @endforeach
                    @endforeach
                </tbody>
            </table>

            @if ($withReceipts)
                <div class="page-break"></div>
                <h3>Lampiran Nota: {{ $project['name'] }}</h3>
                <div class="receipt-grid">
                    @foreach ($project['expenses'] as $expense)
                        @if ($expense->receipt_image)
                            <div class="receipt-item">
                                <div style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 5px;">
                                    <div style="font-weight: bold; font-size: 11px;">{{ $expense->title }}</div>
                                    <div style="font-size: 10px; color: #666;">
                                        {{ $expense->transacted_at->format('d F Y') }}</div>
                                </div>

                                {{-- Gambar Nota --}}
                                <img src="{{ public_path('storage/' . $expense->receipt_image) }}" class="receipt-img">

                                {{-- Harga di Nota --}}
                                <div style="text-align: right; font-weight: bold; font-size: 12px; color: #333;">
                                    Rp {{ number_format($expense->amount, 0, ',', '.') }}
                                </div>
                            </div>
                        @endif
                    @endforeach
                </div>
                <div class="page-break"></div>
            @endif
        </div>
        <hr style="border: 0; border-top: 2px dashed #ccc; margin: 30px 0;">
    @endforeach

</body>

</html>
