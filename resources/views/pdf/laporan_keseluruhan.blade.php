<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Laporan Keseluruhan Proyek</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: #111;
            line-height: 1.4;
        }

        /* Kop Surat Utama */
        .main-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .company-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }

        /* Section per Proyek (BAGIAN 1) */
        .project-section {
            margin-bottom: 18px;
            /* penting: JANGAN paksa pindah halaman tiap proyek */
            page-break-after: auto;
            break-after: auto;

            /* bantu supaya tabel proyek tidak “kepotong aneh” */
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .judul {
            text-align: center;
            margin: 10px 0 12px 0;
        }

        .judul .h1 {
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 2px;
        }

        /* Info Box */
        .info-box {
            width: 100%;
            margin: 10px 0 14px 0;
            border: 1px solid #000;
            border-collapse: collapse;
        }

        .info-box td {
            padding: 4px 6px;
            border: 1px solid #000;
        }

        /* Data Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 4px 6px;
        }

        .data-table th {
            background-color: #f0f0f0;
            text-align: left;
            font-weight: bold;
        }

        /* Highlight Header Pekan */
        .week-header {
            background-color: #e2e2e2;
            font-weight: bold;
            color: #333;
            padding-top: 8px;
            padding-bottom: 8px;
            font-style: italic;
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

        /* Page Break */
        .page-break {
            page-break-before: always;
            break-before: page;
        }

        /* Lampiran */
        .lampiran-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin: 10px 0 15px 0;
        }

        .grid-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 20px;
        }

        .grid-cell {
            width: 50%;
            padding: 10px;
            border: 1px solid #ddd;
            vertical-align: top;
            height: 380px;
        }

        .grid-meta {
            margin-bottom: 8px;
            font-size: 11px;
            border-bottom: 1px dashed #999;
            padding-bottom: 5px;
        }

        .grid-img-container {
            text-align: center;
            display: block;
        }

        .grid-img {
            max-width: 100%;
            max-height: 280px;
            width: auto;
            height: auto;
            margin: 0 auto;
        }

        .empty-cell {
            border: none;
        }
    </style>
</head>

<body>

    {{-- HEADER UTAMA LAPORAN --}}
    <div class="main-header">
        <img src="https://jkk.sangkolo.store/images/logo.png" style="height: 50px; margin-bottom: 5px;">
        <div class="company-name">PT. JAYA KARYA KONSTRUKSI</div>
        <div style="font-size: 11px;">LAPORAN KEUANGAN KESELURUHAN PROYEK</div>
        <div style="font-size: 10px; margin-top: 5px;">Dicetak pada: {{ $generatedAt }}</div>
    </div>

    {{-- =========================
        BAGIAN 1: TOTAL & DETAIL PER PROYEK (TANPA LAMPIRAN)
        Semua proyek nyambung, TIDAK dipaksa halaman baru
       ========================= --}}

    @php
        $grandTotal = 0;
        foreach ($projects as $p) {
            $grandTotal += $p->expenses->sum('amount');
        }
    @endphp

    <table class="info-box" style="margin-top: 0;">
        <tr>
            <td width="30%" class="text-bold">TOTAL SEMUA PROYEK</td>
            <td class="text-bold">Rp {{ number_format($grandTotal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="text-bold">Jumlah Proyek</td>
            <td>{{ $projects->count() }}</td>
        </tr>
    </table>

    @foreach ($projects as $project)
        <div class="project-section">

            {{-- JUDUL PER PROYEK --}}
            <div class="judul">
                <div class="h1">{{ $project->name }}</div>
                <div style="font-size: 11px;">
                    Status: {{ $project->status == 'ongoing' ? 'Sedang Berjalan' : 'Selesai' }}
                </div>
            </div>

            {{-- INFO PROYEK --}}
            <table class="info-box">
                <tr>
                    <td width="20%" class="text-bold">Mandor</td>
                    <td width="30%">{{ $project->mandor ? $project->mandor->name : '-' }}</td>
                    <td width="20%" class="text-bold">Lokasi</td>
                    <td>{{ $project->coordinates ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="text-bold">Deskripsi</td>
                    <td colspan="3">{{ $project->description ?? '-' }}</td>
                </tr>
            </table>

            {{-- TABEL PENGELUARAN --}}
            @php
                $total = 0;
                $currentWeek = null;
            @endphp

            <table class="data-table">
                <thead>
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="15%">Tanggal</th>
                        <th>Keterangan</th>
                        <th width="10%" class="text-center">Ref</th>
                        <th width="20%" class="text-right">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($project->expenses as $index => $expense)
                        @php
                            $total += $expense->amount;

                            $dateObj = \Carbon\Carbon::parse($expense->transacted_at);
                            $weekNum = $dateObj->isoWeek();
                            $yearNum = $dateObj->year;
                            $weekKey = $yearNum . '-' . $weekNum;

                            $startOfWeek = $dateObj->copy()->startOfWeek()->format('d M');
                            $endOfWeek = $dateObj->copy()->endOfWeek()->format('d M Y');
                        @endphp

                        @if ($currentWeek !== $weekKey)
                            <tr>
                                <td colspan="5" class="week-header">
                                    Pekan ke-{{ $weekNum }} ({{ $startOfWeek }} - {{ $endOfWeek }})
                                </td>
                            </tr>
                            @php $currentWeek = $weekKey; @endphp
                        @endif

                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</td>
                            <td>
                                <strong>{{ $expense->title }}</strong>
                                @if ($expense->description)
                                    <br><span style="font-size: 10px; color: #555;">{{ $expense->description }}</span>
                                @endif
                            </td>
                            <td class="text-center">{{ $expense->receipt_image ? 'Ada' : '-' }}</td>
                            <td class="text-right">{{ number_format($expense->amount, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach

                    @if ($project->expenses->isEmpty())
                        <tr>
                            <td colspan="5" class="text-center" style="padding: 10px;">
                                Belum ada data pengeluaran.
                            </td>
                        </tr>
                    @endif
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" class="text-right text-bold">TOTAL PENGELUARAN</td>
                        <td class="text-right text-bold">Rp {{ number_format($total, 0, ',', '.') }}</td>
                    </tr>
                </tfoot>
            </table>

        </div>
    @endforeach


    {{-- =========================
        BAGIAN 2: LAMPIRAN
        Per proyek mulai halaman baru
       ========================= --}}

    @php
        // cek apakah ada lampiran sama sekali
        $hasAnyAttachment = false;
        foreach ($projects as $p) {
            $cnt = $p->expenses
                ->filter(function ($e) {
                    return !empty($e->receipt_image) && file_exists(storage_path('app/public/' . $e->receipt_image));
                })
                ->count();
            if ($cnt > 0) {
                $hasAnyAttachment = true;
                break;
            }
        }

        $firstLampiranProject = true;
    @endphp

    @if ($hasAnyAttachment)
        {{-- Pindah ke bagian lampiran sekali saja --}}
        <div class="page-break"></div>

        <div class="lampiran-title">LAMPIRAN BUKTI TRANSAKSI</div>

        @foreach ($projects as $project)
            @php
                $expensesWithImages = $project->expenses->filter(function ($e) {
                    return !empty($e->receipt_image) && file_exists(storage_path('app/public/' . $e->receipt_image));
                });
            @endphp

            @if ($expensesWithImages->count() == 0)
                @continue
            @endif

            {{-- Per proyek mulai halaman baru (kecuali proyek pertama lampiran, supaya ga bikin halaman kosong) --}}
            @if (!$firstLampiranProject)
                <div class="page-break"></div>
            @endif
            @php $firstLampiranProject = false; @endphp

            <div class="judul" style="margin-top: 0;">
                <div class="h1">Lampiran: {{ $project->name }}</div>
                <div style="font-size: 11px;">
                    Status: {{ $project->status == 'ongoing' ? 'Sedang Berjalan' : 'Selesai' }}
                </div>
            </div>

            {{-- Loop chunk 4 untuk 2x2 per halaman (di dalam proyek yang sama) --}}
            @foreach ($expensesWithImages->chunk(4) as $chunkIndex => $chunk)
                {{-- chunk berikutnya halaman baru, tapi chunk pertama tetap satu halaman dengan judul proyek --}}
                @if ($chunkIndex > 0)
                    <div class="page-break"></div>
                @endif

                <div class="lampiran-title" style="font-size: 12px; text-decoration: none;">
                    {{ $project->name }} (Hal {{ $chunkIndex + 1 }})
                </div>

                <table class="grid-table">
                    <tr>
                        @foreach ($chunk->slice(0, 2) as $expense)
                            <td class="grid-cell">
                                <div class="grid-meta">
                                    <strong>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</strong>
                                    - {{ $expense->title }} (Rp {{ number_format($expense->amount, 0, ',', '.') }})
                                </div>
                                <div class="grid-img-container">
                                    @php
                                        $path = storage_path('app/public/' . $expense->receipt_image);
                                        $type = pathinfo($path, PATHINFO_EXTENSION);
                                        $data = file_get_contents($path);
                                        $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                                    @endphp
                                    <img src="{{ $base64 }}" class="grid-img">
                                </div>
                            </td>
                        @endforeach
                        @if ($chunk->slice(0, 2)->count() < 2)
                            <td class="empty-cell"></td>
                        @endif
                    </tr>

                    @if ($chunk->count() > 2)
                        <tr>
                            @foreach ($chunk->slice(2, 2) as $expense)
                                <td class="grid-cell">
                                    <div class="grid-meta">
                                        <strong>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</strong>
                                        - {{ $expense->title }} (Rp
                                        {{ number_format($expense->amount, 0, ',', '.') }})
                                    </div>
                                    <div class="grid-img-container">
                                        @php
                                            $path = storage_path('app/public/' . $expense->receipt_image);
                                            $type = pathinfo($path, PATHINFO_EXTENSION);
                                            $data = file_get_contents($path);
                                            $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                                        @endphp
                                        <img src="{{ $base64 }}" class="grid-img">
                                    </div>
                                </td>
                            @endforeach
                            @if ($chunk->slice(2, 2)->count() < 2)
                                <td class="empty-cell"></td>
                            @endif
                        </tr>
                    @endif
                </table>
            @endforeach
        @endforeach
    @endif

</body>

</html>
