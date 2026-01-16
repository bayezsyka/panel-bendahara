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

        /* Surat resmi */
        .kop {
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .kop-table {
            width: 100%;
            border: none;
            border-collapse: collapse;
        }

        .kop-table td {
            vertical-align: middle;
        }

        .logo-box {
            width: 90px;
            height: 60px;
            border: 1px solid #999;
            text-align: center;
            font-size: 10px;
            color: #666;
        }

        .kop-title {
            text-align: center;
        }

        .kop-title .company {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .kop-title .meta {
            font-size: 11px;
        }

        .surat-meta {
            width: 100%;
            margin: 12px 0 8px 0;
            border: none;
        }

        .surat-meta td {
            padding: 2px 0;
            vertical-align: top;
        }

        .judul {
            text-align: center;
            margin: 14px 0 12px 0;
        }

        .judul .h1 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            margin-bottom: 2px;
        }

        .judul .h2 {
            font-size: 12px;
            margin: 0;
        }

        .p {
            margin: 6px 0;
            text-align: justify;
        }

        .info-box {
            width: 100%;
            margin: 10px 0 14px 0;
            border: 1px solid #000;
            border-collapse: collapse;
        }

        .info-box td {
            padding: 6px 8px;
            vertical-align: top;
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
            padding: 6px 8px;
        }

        .data-table th {
            background-color: #f0f0f0;
            text-align: left;
            font-weight: bold;
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

        .ttd-wrap {
            width: 100%;
            margin-top: 18px;
        }

        .ttd-table {
            width: 100%;
            border: none;
            border-collapse: collapse;
        }

        .ttd-table td {
            vertical-align: top;
        }

        .ttd-box {
            width: 55%;
            float: right;
            text-align: center;
        }

        .ttd-space {
            height: 70px;
        }

        .footer-print {
            margin-top: 10px;
            text-align: right;
            font-size: 10px;
            color: #555;
        }

        /* Lampiran */
        .page-break {
            page-break-before: always;
        }

        .lampiran-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            margin: 8px 0 14px 0;
        }

        .lampiran-item {
            border: 1px solid #999;
            padding: 10px;
            margin-bottom: 22px;
            page-break-inside: avoid;
        }

        .lampiran-detail {
            width: 100%;
            margin-bottom: 10px;
            border-bottom: 1px dashed #ccc;
            border-collapse: collapse;
        }

        .lampiran-detail td {
            padding: 2px 0;
            border: none;
        }

        .lampiran-img-container {
            text-align: center;
            padding: 10px;
            background-color: #f9f9f9;
        }

        .lampiran-img {
            max-width: 95%;
            max-height: 500px;
            height: auto;
        }
    </style>
</head>

<body>

    {{-- ============================== --}}
    {{-- KOP SURAT PERUSAHAAN           --}}
    {{-- ============================== --}}
    <div class="kop">
        <table class="kop-table">
            <tr>
                <td style="width: 110px;">
                    {{-- Ganti dengan <img src="..."> jika sudah ada logo --}}
                    <div>
                        <img src="https://jkk.sangkolo.store/images/logo.png" alt="Logo"
                            style="width: 100%; height: auto;">
                    </div>
                </td>
                <td class="kop-title">
                    <div class="company">PT. JAYA KARYA KONSTRUKSI</div>
                </td>
                <td style="width: 110px;"></td>
            </tr>
        </table>
    </div>

    {{-- ============================== --}}
    {{-- IDENTITAS SURAT                --}}
    {{-- ============================== --}}
    <table class="surat-meta">
        <tr>
            <td style="width: 60%;">
                <table style="width:100%; border:none;">
                    <tr>
                        <td style="width: 22%;">Perihal</td>
                        <td style="width: 3%;">:</td>
                        <td class="text-bold">Laporan Keuangan Proyek</td>
                    </tr>
                </table>
            </td>
            <td style="width: 40%;" class="text-right">
                {{ date('d F Y') }}
            </td>
        </tr>
    </table>

    {{-- ============================== --}}
    {{-- JUDUL LAPORAN                  --}}
    {{-- ============================== --}}
    <div class="judul">
        <div class="h1">Laporan Keuangan Proyek</div>
        <div class="h2">{{ $project->name }}</div>
        <div class="h2">Periode: {{ $periode }}</div>
    </div>

    {{-- ============================== --}}
    {{-- RINGKASAN INFO PROYEK          --}}
    {{-- ============================== --}}
    <table class="info-box">
        <tr>
            <td style="width: 20%;" class="text-bold">Nama Proyek</td>
            <td style="width: 30%;">{{ $project->name }}</td>
            <td style="width: 20%;" class="text-bold">Periode</td>
            <td>{{ $periode }}</td>
        </tr>
        <tr>
            <td class="text-bold">Status</td>
            <td>{{ $project->status == 'ongoing' ? 'Sedang Berjalan' : 'Selesai' }}</td>
            <td class="text-bold">Lokasi</td>
            <td>{{ $project->coordinates ?? '-' }}</td>
        </tr>
        <tr>
            <td class="text-bold">Deskripsi</td>
            <td colspan="3">{{ $project->description ?? '-' }}</td>
        </tr>
    </table>

    {{-- ============================== --}}
    {{-- TABEL PENGELUARAN              --}}
    {{-- ============================== --}}
    <table class="data-table">
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="15%">Tanggal</th>
                <th>Keterangan Pengeluaran</th>
                <th width="10%" class="text-center">Bukti</th>
                <th width="20%" class="text-right">Jumlah (IDR)</th>
            </tr>
        </thead>
        <tbody>
            @php $total = 0; @endphp
            @foreach ($expenses as $index => $expense)
                @php $total += $expense->amount; @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d/m/Y') }}</td>
                    <td>
                        <strong>{{ $expense->title }}</strong>
                        @if ($expense->description)
                            <br><span style="font-size: 11px;">{{ $expense->description }}</span>
                        @endif
                    </td>
                    <td class="text-center">
                        {{ $expense->receipt_image ? 'Terlampir' : '-' }}
                    </td>
                    <td class="text-right">{{ number_format($expense->amount, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" class="text-right text-bold">TOTAL PENGELUARAN</td>
                <td class="text-right text-bold">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer-print">
        Dicetak pada: {{ date('d F Y, H:i') }}
    </div>

    {{-- ============================== --}}
    {{-- HALAMAN LAMPIRAN FOTO          --}}
    {{-- ============================== --}}
    @php
        $hasImages = $expenses->contains(function ($expense) {
            return !empty($expense->receipt_image);
        });
    @endphp

    @if ($hasImages)
        <div class="page-break"></div>

        <div class="lampiran-title">LAMPIRAN BUKTI TRANSAKSI</div>

        @foreach ($expenses as $index => $expense)
            @if ($expense->receipt_image)
                <div class="lampiran-item">
                    <table class="lampiran-detail">
                        <tr>
                            <td width="18%"><strong>No. Transaksi</strong></td>
                            <td width="2%">:</td>
                            <td width="30%">#{{ $index + 1 }}</td>

                            <td width="18%"><strong>Tanggal</strong></td>
                            <td width="2%">:</td>
                            <td>{{ \Carbon\Carbon::parse($expense->transacted_at)->format('d F Y') }}</td>
                        </tr>
                        <tr>
                            <td><strong>Keperluan</strong></td>
                            <td>:</td>
                            <td>{{ $expense->title }}</td>

                            <td><strong>Nominal</strong></td>
                            <td>:</td>
                            <td>Rp {{ number_format($expense->amount, 0, ',', '.') }}</td>
                        </tr>
                    </table>

                    <div class="lampiran-img-container">
                        @php
                            $imagePath = storage_path('app/public/' . $expense->receipt_image);
                            $base64Image = null;

                            if (file_exists($imagePath)) {
                                $type = pathinfo($imagePath, PATHINFO_EXTENSION);
                                $data = file_get_contents($imagePath);
                                $base64Image = 'data:image/' . $type . ';base64,' . base64_encode($data);
                            }
                        @endphp

                        @if ($base64Image)
                            <img src="{{ $base64Image }}" class="lampiran-img" alt="Bukti Transaksi">
                        @else
                            <div style="padding: 50px; color: #777; border: 1px dashed #ccc;">
                                File gambar tidak ditemukan di server.
                            </div>
                        @endif
                    </div>
                </div>
            @endif
        @endforeach
    @endif

</body>

</html>
