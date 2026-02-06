<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Laporan Proyek</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: #111;
            line-height: 1.4;
        }

        .kop {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .kop-table {
            width: 100%;
            border-collapse: collapse;
        }

        .company {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .judul {
            text-align: center;
            margin: 14px 0 12px 0;
        }

        .judul .h1 {
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 2px;
        }

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

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
            /* Pastikan teks mulai dari atas */
        }

        .data-table th {
            background-color: #f0f0f0;
            text-align: left;
            font-weight: bold;
        }

        .week-header {
            background-color: #e2e2e2;
            font-weight: bold;
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

        /* Styles untuk Lampiran Grid */
        .page-break {
            page-break-before: always;
        }

        .lampiran-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 15px;
        }

        .grid-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .grid-cell {
            width: 50%;
            padding: 10px;
            border: 1px solid #ddd;
            vertical-align: top;
            height: 400px;
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

        /* Style Khusus Item Detail */
        .item-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 3px;
        }

        .item-table td {
            border: none;
            /* Hilangkan border tabel dalam */
            padding: 1px 0;
            color: #333;
        }
    </style>
</head>

<body>
    {{-- KOP SURAT --}}
    <div class="kop">
        <table class="kop-table">
            <tr>
                <td style="width: 15%; text-align:center;">
                    <img src="{{ public_path('images/logo.png') }}" style="height: 60px;">
                </td>
                <td style="text-align: center;">
                    <div class="company">PT. JAYA KARYA KONTRUKSI</div>
                    <div style="font-size: 11px;">General Contractor & Supplier</div>
                </td>
                <td style="width: 15%;"></td>
            </tr>
        </table>
    </div>

    <div class="judul">
        <div class="h1">LAPORAN KEUANGAN PROYEK</div>
        <div>{{ $project->name }}</div>
    </div>

    {{-- INFO PROYEK --}}
    <table class="info-box">
        <tr>
            <td width="20%" class="text-bold">Nama Proyek</td>
            <td width="30%">{{ $project->name }}</td>
            <td width="20%" class="text-bold">Status</td>
            <td>{{ $project->status == 'ongoing' ? 'Sedang Berjalan' : 'Selesai' }}</td>
        </tr>
        <tr>
            <td class="text-bold">Mandor</td>
            <td>{{ $project->mandor ? $project->mandor->name : '-' }}</td>
            <td class="text-bold">Lokasi</td>
            <td>{{ $project->coordinates ?? '-' }}</td>
        </tr>
    </table>

    {{-- TABEL PENGELUARAN DENGAN HIGHLIGHT MINGGUAN --}}
    {{-- TABEL PENGELUARAN GROUPED BY TIPE BIAYA --}}
    <table class="data-table">
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="15%">Tanggal</th>
                <th>Keterangan & Rincian Item</th>
                <th width="10%" class="text-center">Ref</th>
                <th width="20%" class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @php
                $grandTotal = 0;
            @endphp

            @foreach ($groupedExpenses as $typeName => $expensesInGroup)
                {{-- HEADER GROUP TIPE BIAYA --}}
                <tr style="background-color: #d1e7dd;">
                    <td colspan="5" style="font-weight: bold; font-size: 13px; padding: 6px;">
                        KATEGORI: {{ strtoupper($typeName) }}
                    </td>
                </tr>

                @php
                    $subTotal = 0;
                    $currentWeek = null;
                @endphp

                @foreach ($expensesInGroup as $index => $expense)
                    @php
                        $subTotal += $expense->amount;
                        // Hitung Minggu ke berapa dalam tahun ini
                        $weekNum = \Carbon\Carbon::parse($expense->transacted_at)->isoWeek();
                        $yearNum = \Carbon\Carbon::parse($expense->transacted_at)->format('Y');
                        $weekKey = $yearNum . '-' . $weekNum;
                    @endphp

                    {{-- Row Separator Minggu --}}
                    @if ($currentWeek !== $weekKey)
                        <tr>
                            <td colspan="5" class="week-header" style="font-size: 10px; color: #555;">
                                — Minggu ke-{{ $weekNum }} ({{ $yearNum }})
                            </td>
                        </tr>
                        @php $currentWeek = $weekKey; @endphp
                    @endif

                    <tr>
                        <td class="text-center">{{ $loop->iteration }}</td>
                        <td>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</td>
                        <td>
                            {{-- JUDUL NOTA --}}
                            <strong>{{ $expense->title }}</strong>

                            {{-- RINCIAN ITEM --}}
                            @if ($expense->items && $expense->items->count() > 0)
                                <table class="item-table">
                                    @foreach ($expense->items as $item)
                                        <tr>
                                            <td style="width: 50%; padding-left: 8px;">• {{ $item->name }}</td>
                                            <td style="width: 25%; text-align: right; color: #555;">
                                                {{ $item->quantity }} x {{ number_format($item->price, 0, ',', '.') }}
                                            </td>
                                            <td style="width: 25%; text-align: right; font-weight: bold;">
                                                = {{ number_format($item->total_price, 0, ',', '.') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            {{-- DESKRIPSI TAMBAHAN --}}
                            @if ($expense->description)
                                <div style="margin-top: 4px; font-size: 10px; color: #666; font-style: italic;">
                                    Catatan: {{ $expense->description }}
                                </div>
                            @endif
                        </td>
                        <td class="text-center">{{ $expense->receipt_image ? 'Ada' : '-' }}</td>
                        <td class="text-right">{{ number_format($expense->amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach

                {{-- SUB TOTAL PER TIPE --}}
                <tr style="background-color: #f8f9fa;">
                    <td colspan="4" class="text-right text-bold" style="font-style: italic;">Subtotal
                        {{ $typeName }}</td>
                    <td class="text-right text-bold border-top-double">Rp {{ number_format($subTotal, 0, ',', '.') }}
                    </td>
                </tr>

                @php $grandTotal += $subTotal; @endphp
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" class="text-right text-bold" style="font-size: 14px; padding: 10px;">TOTAL
                    KESELURUHAN PROYEK</td>
                <td class="text-right text-bold" style="font-size: 14px; padding: 10px;">Rp
                    {{ number_format($grandTotal, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <div style="margin-top: 10px; font-size: 10px; text-align: right; color: #777;">
        Dicetak otomatis pada: {{ date('d F Y, H:i') }}
    </div>

    {{-- LAMPIRAN FOTO (GRID 2x2) --}}
    @php
        // Filter hanya yang punya gambar
        $expensesWithImages = $expenses->filter(function ($e) {
            return !empty($e->receipt_image) && file_exists(storage_path('app/public/' . $e->receipt_image));
        });
    @endphp

    @if ($expensesWithImages->count() > 0)

        {{-- Loop per 4 item (Chunk) --}}
        @foreach ($expensesWithImages->chunk(4) as $chunkIndex => $chunk)
            <div class="page-break"></div>
            <div class="lampiran-title">LAMPIRAN BUKTI TRANSAKSI (Hal {{ $loop->iteration }})</div>

            <table class="grid-table">
                {{-- Baris 1: Item 0 dan 1 --}}
                <tr>
                    @foreach ($chunk->slice(0, 2) as $expense)
                        <td class="grid-cell">
                            <div class="grid-meta">
                                <strong>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</strong>
                                -
                                {{ $expense->title }} (Rp {{ number_format($expense->amount, 0, ',', '.') }})
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
                    {{-- Jika ganjil (cuma 1 item di baris ini), isi sel kosong --}}
                    @if ($chunk->slice(0, 2)->count() < 2)
                        <td class="empty-cell"></td>
                    @endif
                </tr>

                {{-- Baris 2: Item 2 dan 3 --}}
                @if ($chunk->count() > 2)
                    <tr>
                        @foreach ($chunk->slice(2, 2) as $expense)
                            <td class="grid-cell">
                                <div class="grid-meta">
                                    <strong>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</strong>
                                    -
                                    {{ $expense->title }} (Rp {{ number_format($expense->amount, 0, ',', '.') }})
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

    @endif

</body>

</html>
