<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $slipGaji->employee_name }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #0f172a;
            font-size: 12px;
            margin: 28px;
        }

        .wrapper {
            border: 1px solid #cbd5e1;
            padding: 24px;
            border-radius: 12px;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }

        .title {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0 0 6px 0;
        }

        .subtitle {
            font-size: 11px;
            color: #475569;
            margin: 0;
        }

        .meta-table,
        .income-table,
        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .meta-label {
            width: 180px;
            font-weight: 700;
        }

        .meta-separator {
            width: 12px;
            text-align: center;
        }

        .section-grid {
            width: 100%;
            margin-top: 22px;
        }

        .section-grid td {
            vertical-align: top;
            width: 50%;
        }

        .section-grid td:first-child {
            padding-right: 10px;
        }

        .section-grid td:last-child {
            padding-left: 10px;
        }

        .box-title {
            background: #e2e8f0;
            color: #0f172a;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            border-bottom: none;
        }

        .income-table th,
        .income-table td {
            border: 1px solid #cbd5e1;
            padding: 9px 12px;
        }

        .income-table th {
            background: #f8fafc;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .text-right {
            text-align: right;
        }

        .net-summary {
            margin-top: 18px;
            border: 1px solid #1d4ed8;
            background: #eff6ff;
            padding: 14px 16px;
        }

        .net-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #1d4ed8;
            margin: 0 0 6px 0;
            font-weight: 700;
        }

        .net-value {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
        }

        .notes {
            margin-top: 18px;
            padding: 12px 14px;
            border: 1px dashed #94a3b8;
            color: #475569;
            line-height: 1.6;
        }

        .signature-table {
            margin-top: 42px;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
        }

        .signature-place {
            margin-bottom: 70px;
        }

        .signature-name {
            font-weight: 700;
            text-decoration: underline;
        }

        .footer-meta {
            margin-top: 20px;
            font-size: 10px;
            color: #64748b;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <table class="header">
            <tr>
                <td>
                    <p class="title">Slip Gaji</p>
                    <p class="subtitle">PT JKK - Dokumen pembayaran gaji karyawan</p>
                </td>
                <td style="text-align: right;">
                    <p class="subtitle" style="margin-bottom: 4px;">Tanggal TF/Cash</p>
                    <p style="font-size: 16px; font-weight: 700; margin: 0;">
                        {{ $slipGaji->tanggal_tf_cash->translatedFormat('d F Y') }}
                    </p>
                </td>
            </tr>
        </table>

        <table class="meta-table">
            <tr>
                <td class="meta-label">Nama</td>
                <td class="meta-separator">:</td>
                <td>{{ $slipGaji->employee_name }}</td>
            </tr>
            <tr>
                <td class="meta-label">NIK</td>
                <td class="meta-separator">:</td>
                <td>{{ $slipGaji->employee_nik ?: '-' }}</td>
            </tr>
            <tr>
                <td class="meta-label">Jabatan</td>
                <td class="meta-separator">:</td>
                <td>{{ $slipGaji->employee_position }}</td>
            </tr>
            <tr>
                <td class="meta-label">Status</td>
                <td class="meta-separator">:</td>
                <td>{{ $slipGaji->status }}</td>
            </tr>
            <tr>
                <td class="meta-label">Periode</td>
                <td class="meta-separator">:</td>
                <td>{{ $slipGaji->periode }}</td>
            </tr>
        </table>

        <table class="section-grid">
            <tr>
                <td>
                    <div class="box-title">Pendapatan</div>
                    <table class="income-table">
                        <thead>
                            <tr>
                                <th>Komponen</th>
                                <th class="text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Gaji Pokok</td>
                                <td class="text-right">Rp {{ number_format($slipGaji->gaji_pokok, 0, ',', '.') }}</td>
                            </tr>
                            <tr>
                                <td>Uang Makan</td>
                                <td class="text-right">Rp {{ number_format($slipGaji->uang_makan, 0, ',', '.') }}</td>
                            </tr>
                            <tr>
                                <td>Uang Lembur</td>
                                <td class="text-right">Rp {{ number_format($slipGaji->uang_lembur, 0, ',', '.') }}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700;">Total Pendapatan</td>
                                <td class="text-right" style="font-weight: 700;">
                                    Rp {{ number_format($slipGaji->gaji_pokok + $slipGaji->uang_makan + $slipGaji->uang_lembur, 0, ',', '.') }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td>
                    <div class="box-title">Potongan</div>
                    <table class="income-table">
                        <thead>
                            <tr>
                                <th>Komponen</th>
                                <th class="text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>BPJS Kesehatan</td>
                                <td class="text-right">Rp {{ number_format($slipGaji->bpjs_kesehatan, 0, ',', '.') }}</td>
                            </tr>
                            <tr>
                                <td>BPJS Ketenagakerjaan</td>
                                <td class="text-right">Rp {{ number_format($slipGaji->bpjs_ketenagakerjaan, 0, ',', '.') }}</td>
                            </tr>
                            <tr>
                                <td>PPh 21</td>
                                <td class="text-right">Rp {{ number_format($slipGaji->pph21, 0, ',', '.') }}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700;">Total Potongan</td>
                                <td class="text-right" style="font-weight: 700;">
                                    Rp {{ number_format($slipGaji->bpjs_kesehatan + $slipGaji->bpjs_ketenagakerjaan + $slipGaji->pph21, 0, ',', '.') }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>

        <div class="net-summary">
            <p class="net-label">Pendapatan Bersih</p>
            <p class="net-value">Rp {{ number_format($slipGaji->pendapatan_bersih, 0, ',', '.') }}</p>
        </div>

        <div class="notes">
            Slip gaji ini dibuat sebagai bukti pembayaran resmi. Mohon diperiksa kembali rincian pendapatan dan potongan sebelum ditandatangani.
        </div>

        <table class="signature-table">
            <tr>
                <td>
                    <div class="signature-place">{{ $slipGaji->tempat_tanggal_ttd }}</div>
                    <div class="signature-name">{{ $slipGaji->direktur }}</div>
                    <div>Direktur</div>
                </td>
                <td>
                    <div class="signature-place">{{ $slipGaji->tempat_tanggal_ttd }}</div>
                    <div class="signature-name">{{ $slipGaji->penerima }}</div>
                    <div>Penerima</div>
                </td>
            </tr>
        </table>

        <div class="footer-meta">
            Dicetak pada {{ now()->translatedFormat('d F Y H:i') }} WIB
            @if ($slipGaji->creator)
                oleh {{ $slipGaji->creator->name }}
            @endif
        </div>
    </div>
</body>

</html>
