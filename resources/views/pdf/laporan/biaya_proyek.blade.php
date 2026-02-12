<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Laporan Proyek</title>
    <style>
        /* =========================
           BASE
        ========================== */
        /* @page margin defined in footer.blade.php — do not redefine here */

        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: #111;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }

        /* =========================
           UTILITIES
        ========================== */
        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .text-bold {
            font-weight: bold;
        }

        .muted {
            color: #666;
        }

        /* =========================
           HEADER TITLE
        ========================== */
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

        /* =========================
           INFO BOX
        ========================== */
        .info-box {
            width: 100%;
            margin: 0 0 12px 0;
            border: 1px solid #000;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .info-box td {
            padding: 6px 8px;
            border: 1px solid #000;
            vertical-align: middle;
        }

        .info-box .label {
            width: 20%;
            font-weight: bold;
            white-space: nowrap;
        }

        .info-box .value {
            width: 30%;
        }

        /* =========================
           MAIN DATA TABLE
        ========================== */
        /* =========================
           MAIN DATA TABLE
        ========================== */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            table-layout: fixed;
            /* Added stability */
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .data-table thead th {
            background-color: #efefef;
            text-align: center;
            font-weight: bold;
            vertical-align: middle;
            padding: 7px 8px;
        }

        .data-table .col-no {
            width: 5%;
        }

        .data-table .col-date {
            width: 15%;
        }

        .data-table .col-detail {
            width: 58%;
        }

        .data-table .col-amount {
            width: 22%;
        }

        /* Group header */
        .group-header {
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        .group-header td {
            background-color: #d1e7dd;
            font-weight: bold;
            font-size: 12px;
            padding: 7px 8px;
        }

        /* Weekly separator */
        .week-header {
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        .week-header td {
            background-color: #f6f6f6;
            font-weight: bold;
            font-style: italic;
            font-size: 10px;
            color: #444;
            padding: 5px 8px;
        }

        /* Subtotal row */
        .subtotal-row td {
            background-color: #f8f9fa;
        }

        .subtotal-row .label-subtotal {
            font-style: italic;
            font-weight: bold;
            background-color: #f8f9fa;
        }

        /* Grand total row */
        .grand-total td {
            font-size: 13px;
            font-weight: bold;
            padding: 10px 8px;
        }

        /* Inner item table */
        .item-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 4px;
        }

        .item-table td {
            border: none;
            padding: 2px 0;
            color: #333;
            vertical-align: top;
        }

        .note {
            margin-top: 5px;
            font-size: 10px;
            color: #666;
            font-style: italic;
        }

        /* =========================
           ATTACHMENTS (LAMPIRAN)
        ========================== */
        .page-break {
            page-break-before: always;
        }

        .lampiran-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin: 0 0 14px 0;
        }

        .grid-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .grid-cell {
            width: 50%;
            padding: 10px;
            border: 1px solid #bbb;
            vertical-align: top;
            height: 380px;
        }

        .grid-meta {
            margin: 0 0 8px 0;
            font-size: 11px;
            padding: 0 0 6px 0;
            border-bottom: 1px dashed #999;
            line-height: 1.25;
        }

        .grid-img-container {
            text-align: center;
            width: 100%;
            display: block;
            padding-top: 6px;
        }

        .grid-img {
            max-width: 100%;
            max-height: 280px;
            width: auto;
            height: auto;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 4px;
            background: #fff;
        }

        .empty-cell {
            border: none;
        }

        /* Improve print consistency */
        img {
            page-break-inside: avoid;
        }

        /*
        .data-table tr {
            page-break-inside: auto;
        }

        .data-table td,
        .data-table th {
            page-break-inside: auto;
        }
        */
    </style>
</head>

<body>
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <div class="judul">
        <div class="h1">LAPORAN KEUANGAN PROYEK</div>
        <div class="sub">{{ $project->name }}</div>
    </div>

    {{-- INFO PROYEK --}}

    <table class="info-box">
        <tr>
            <td class="label">Nama Proyek</td>
            <td class="value">{{ $project->name }}</td>
            <td class="label">Status</td>
            <td class="value">{{ $project->status == 'ongoing' ? 'Sedang Berjalan' : 'Selesai' }}</td>
        </tr>
        <tr>
            <td class="label">Pelaksana</td>
            <td class="value">
                @if ($project->mandors->count() > 0)
                    {{ $project->mandors->pluck('name')->implode(', ') }}@else{{ $project->mandor ? $project->mandor->name : '-' }}
                @endif
            </td>
            <td class="label">Lokasi</td>
            <td class="value">{{ $project->coordinates ?? '-' }}</td>
        </tr>
    </table>

    {{-- TABEL PENGELUARAN GROUPED BY TIPE BIAYA --}}

    <table class="data-table">
        <thead>
            <tr>
                <th class="col-no text-center">No</th>
                <th class="col-date text-center">Tanggal</th>
                <th class="col-detail text-center">Keterangan & Rincian Item</th>
                <th class="col-amount text-center">Jumlah</th>
            </tr>
        </thead>
        @php $grandTotal = 0; @endphp

        @foreach ($groupedExpenses as $typeName => $expensesInGroup)
            @php
                $subTotal = 0;
                $currentWeek = null;
            @endphp

            @foreach ($expensesInGroup as $index => $expense)
                @php
                    $subTotal += $expense->amount;
                    $weekNum = \Carbon\Carbon::parse($expense->transacted_at)->isoWeek();
                    $yearNum = \Carbon\Carbon::parse($expense->transacted_at)->format('Y');
                    $weekKey = $yearNum . '-' . $weekNum;

                    $isFirstItem = $index === 0;
                    $isLastItem = $loop->last;
                    $newWeek = $currentWeek !== $weekKey;

                    // If it's a header or footer row, we use a tbody that avoids breaks
                    // to keep the header/footer with this item.
                    $keepWithNext = $isFirstItem || $newWeek;
                    $keepWithPrev = $isLastItem;
                @endphp

                <tbody style="{{ $keepWithNext || $keepWithPrev ? 'page-break-inside: avoid;' : '' }}">
                    {{-- HEADER GROUP TIPE BIAYA --}}
                    @if ($isFirstItem)
                        <tr class="group-header">
                            <td colspan="4">
                                KATEGORI: {{ strtoupper($typeName) }}
                            </td>
                        </tr>
                    @endif

                    {{-- Row Separator Minggu --}}
                    @if ($newWeek)
                        <tr class="week-header">
                            <td colspan="4">
                                — Minggu ke-{{ $weekNum }} ({{ $yearNum }})
                            </td>
                        </tr>
                        @php $currentWeek = $weekKey; @endphp
                    @endif

                    <tr>
                        <td class="text-center">{{ $loop->iteration }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}
                        </td>
                        <td>
                            <strong>{{ $expense->title }}</strong>

                            @if ($expense->items && $expense->items->count() > 0)
                                <table class="item-table">
                                    @foreach ($expense->items as $item)
                                        <tr>
                                            <td style="width: 52%; padding-left: 10px;">• {{ $item->name }}</td>
                                            <td style="width: 23%; text-align: right;" class="muted">
                                                {{ $item->quantity }} x {{ number_format($item->price, 0, ',', '.') }}
                                            </td>
                                            <td style="width: 25%; text-align: right; font-weight: bold;">
                                                = {{ number_format($item->total_price, 0, ',', '.') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            @if ($expense->description)
                                <div class="note">
                                    Catatan: {{ trim($expense->description) }}
                                </div>
                            @endif
                        </td>
                        <td class="text-right">{{ number_format($expense->amount, 0, ',', '.') }}</td>
                    </tr>

                    {{-- SUB TOTAL PER TIPE --}}
                    @if ($isLastItem)
                        <tr class="subtotal-row">
                            <td colspan="3" class="text-right label-subtotal">Subtotal {{ $typeName }}</td>
                            <td class="text-right text-bold">Rp {{ number_format($subTotal, 0, ',', '.') }}</td>
                        </tr>
                    @endif
                </tbody>
            @endforeach

            @php $grandTotal += $subTotal; @endphp
        @endforeach
        <tfoot>
            <tr class="grand-total">
                <td colspan="3" class="text-right">TOTAL KESELURUHAN PROYEK</td>
                <td class="text-right">Rp {{ number_format($grandTotal, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    {{-- LAMPIRAN FOTO (GRID 2x2) --}}
    @php
        $expensesWithImages = $expenses->filter(function ($e) {
            return !empty($e->receipt_image) && file_exists(storage_path('app/public/' . $e->receipt_image));
        });
    @endphp

    @if ($expensesWithImages->count() > 0)

        @foreach ($expensesWithImages->chunk(4) as $chunkIndex => $chunk)
            <div class="page-break"></div>
            <div class="lampiran-title">LAMPIRAN BUKTI TRANSAKSI (Hal {{ $loop->iteration }})</div>

            <table class="grid-table">
                <tr>
                    @foreach ($chunk->slice(0, 2) as $expense)
                        <td class="grid-cell">
                            <div class="grid-meta">
                                <strong>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</strong>
                                -
                                {{ $expense->title }}
                                <span class="muted">(Rp {{ number_format($expense->amount, 0, ',', '.') }})</span>
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
                                    -
                                    {{ $expense->title }}
                                    <span class="muted">(Rp {{ number_format($expense->amount, 0, ',', '.') }})</span>
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
