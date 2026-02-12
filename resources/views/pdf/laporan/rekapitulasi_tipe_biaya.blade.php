<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Laporan Tipe Biaya</title>
    <style>
        @page {
            margin: 1cm 1cm 2cm 1cm;
        }

        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: #111;
            line-height: 1.4;
            margin: 0;
            padding: 0;
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
        }

        .data-table th {
            background-color: #f0f0f0;
            text-align: left;
            font-weight: bold;
        }

        .project-header {
            background-color: #d1e7dd;
            font-weight: bold;
            font-size: 13px;
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

        .item-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 3px;
        }

        .item-table td {
            border: none;
            padding: 1px 0;
            color: #333;
        }

        .subtotal-row {
            background-color: #f8f9fa;
        }

        .grandtotal-row {
            background-color: #e9ecef;
        }
    </style>
</head>

<body>
    @include('pdf.komponen.footer')
    @include('pdf.komponen.header')

    <div class="judul">
        <div class="h1">LAPORAN KEUANGAN PER TIPE BIAYA</div>
        <div>{{ $expenseType->name }}</div>
    </div>

    {{-- INFO RINGKASAN --}}
    <table class="info-box">
        <tr>
            <td width="20%" class="text-bold">Tipe Biaya</td>
            <td width="30%">{{ $expenseType->name }}</td>
            <td width="20%" class="text-bold">Total Transaksi</td>
            <td>{{ $groupedByProject->sum(fn($g) => $g['expenses']->count()) }} transaksi</td>
        </tr>
        <tr>
            <td class="text-bold">Jumlah Proyek</td>
            <td>{{ $groupedByProject->count() }} proyek</td>
            <td class="text-bold">Total Pengeluaran</td>
            <td class="text-bold">Rp {{ number_format($grandTotal, 0, ',', '.') }}</td>
        </tr>
    </table>

    {{-- TABEL PENGELUARAN GROUPED BY PROJECT --}}
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
                $globalNo = 1;
            @endphp

            @foreach ($groupedByProject as $group)
                {{-- HEADER PROJECT --}}
                <tr class="project-header">
                    <td colspan="5" style="padding: 6px;">
                        PROYEK: {{ strtoupper($group['project']->name) }} @if ($group['project']->mandors->count() > 0)
                            - Pelaksana: {{ $group['project']->mandors->pluck('name')->implode(', ') }}
                        @elseif($group['project']->mandor)
                            - Pelaksana: {{ $group['project']->mandor->name }}
                        @endif
                    </td>
                </tr>

                @php
                    $currentWeek = null;
                @endphp

                @foreach ($group['expenses'] as $expense)
                    @php
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
                        <td class="text-center">{{ $globalNo++ }}</td>
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

                {{-- SUBTOTAL PER PROJECT --}}
                <tr class="subtotal-row">
                    <td colspan="4" class="text-right text-bold" style="font-style: italic;">
                        Subtotal {{ $group['project']->name }}
                    </td>
                    <td class="text-right text-bold">Rp {{ number_format($group['total'], 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="grandtotal-row">
                <td colspan="4" class="text-right text-bold" style="font-size: 14px; padding: 10px;">
                    TOTAL KESELURUHAN {{ strtoupper($expenseType->name) }}
                </td>
                <td class="text-right text-bold" style="font-size: 14px; padding: 10px;">
                    Rp {{ number_format($grandTotal, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>



</body>

</html>
