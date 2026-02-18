<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #000;
            margin: 0;
            padding: 20px;
        }

        .container {
            width: 100%;
        }

        /* Header Section */
        .header-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 2px;
        }

        .header-address {
            font-size: 10px;
            margin-bottom: 10px;
            line-height: 1.2;
        }

        .invoice-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
            letter-spacing: 2px;
            text-decoration: underline;
        }

        /* Info Grid (Customer & Project Details) */
        .info-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .info-table td {
            padding: 2px 0;
            vertical-align: top;
        }

        .label {
            width: 12%;
            white-space: nowrap;
        }

        .separator {
            width: 2%;
            text-align: center;
        }

        .content {
            width: 36%;
        }

        /* Main Transaction Table */
        .trans-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .trans-table th {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
            font-weight: bold;
            background-color: #f0f0f0;
        }

        .trans-table td {
            border: 1px solid #000;
            padding: 5px;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        /* Totals Section */
        .total-row td {
            border: none;
            padding: 3px 5px;
        }

        .grand-total {
            font-weight: bold;
            border-top: 1px solid #000 !important;
            border-bottom: 1px solid #000 !important;
        }

        /* Terbilang Box */
        .terbilang-box {
            border: 1px solid #000;
            padding: 8px;
            font-style: italic;
            font-weight: bold;
            margin-bottom: 20px;
            background-color: #f9f9f9;
        }

        /* Footer / Signatures */
        .footer-table {
            width: 100%;
            margin-top: 20px;
        }

        .footer-table td {
            text-align: center;
            vertical-align: bottom;
            height: 80px;
        }

        /* Bank Info */
        .bank-info {
            font-size: 9px;
            margin-top: 20px;
            font-style: italic;
            line-height: 1.4;
        }

        .no-bottom-border {
            border-bottom: none !important;
        }

        .no-top-border {
            border-top: none !important;
        }
    </style>
</head>

<body>

    <div class="container">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="width: 40%; vertical-align: top;">
                    @php
                        $logoPath = public_path('images/logo.png');
                        $logoData = '';
                        if (file_exists($logoPath)) {
                            $logoData = base64_encode(file_get_contents($logoPath));
                        }
                    @endphp
                    @if ($logoData)
                        <img src="data:image/png;base64,{{ $logoData }}" style="height: 80px;">
                    @endif
                </td>
                <td style="width: 60%; text-align: right; vertical-align: top; padding-top: 5px;">
                    <div class="header-title" style="font-size: 14px; margin-bottom: 5px;">PT. JAYA KARYA KONTRUKSI</div>
                    <div class="header-address" style="font-size: 9px; line-height: 1.4;">
                        DESA BULAKELOR, KEC. KETANGGUNGAN<br>
                        KAB. BREBES, JAWA TENGAH, INDONESIA<br>
                        TELP : (0283) 673063, HP. 081333019023<br>
                        NPWP : 75.692.855.2.501.000
                    </div>
                </td>
            </tr>
        </table>

        <div class="invoice-title" style="margin-top: 0; padding-top: 10px;">I N V O I C E</div>

        <table class="info-table">
            <tr>
                <td class="label">Customer</td>
                <td class="separator">:</td>
                <td class="content">{{ $customer->name }}</td>
                <td class="label">Doc. No.</td>
                <td class="separator">:</td>
                <td class="content">
                    {{ $doc_no ?? 'INV/JKK/' . date('Y/m', strtotime($invoiceDate)) . '/' . str_pad($project->id, 4, '0', STR_PAD_LEFT) }}
                </td>
            </tr>
            <tr>
                <td class="label">Address</td>
                <td class="separator">:</td>
                <td class="content">{{ $customer->address ?? '-' }}</td>
                <td class="label">Date</td>
                <td class="separator">:</td>
                <td class="content">{{ date('d-m-Y', strtotime($invoiceDate)) }}</td>
            </tr>
            <tr>
                <td class="label">Contact</td>
                <td class="separator">:</td>
                <td class="content">{{ $customer->contact ?? '-' }}</td>
                <td class="label">Delivery Note/Date</td>
                <td class="separator">:</td>
                <td class="content">{{ $delivery_note ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">NPWP</td>
                <td class="separator">:</td>
                <td class="content">{{ $customer->npwp ?? '-' }}</td>
                <td class="label">PO atau SO No./Date</td>
                <td class="separator">:</td>
                <td class="content">{{ $po_so_no ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Subcon</td>
                <td class="separator">:</td>
                <td class="content">{{ $project->sub_contractor ?? '-' }}</td>
                <td class="label">Terms of Payment</td>
                <td class="separator">:</td>
                <td class="content">{{ $terms_of_payment ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Contact Person</td>
                <td class="separator">:</td>
                <td class="content">{{ $project->contact_person ?? '-' }}</td>
                <td class="label">Due Date / JT</td>
                <td class="separator">:</td>
                <td class="content">{{ $due_date_jt ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Material</td>
                <td class="separator">:</td>
                <td class="content">Readymix Concrete</td>
                <td class="label"></td>
                <td class="separator"></td>
                <td class="content"></td>
            </tr>
            <tr>
                <td class="label">Location</td>
                <td class="separator">:</td>
                <td class="content">{{ $project->location ?? '-' }}</td>
                <td class="label"></td>
                <td class="separator"></td>
                <td class="content"></td>
            </tr>
            <tr>
                <td class="label">Pekerjaan</td>
                <td class="separator">:</td>
                <td class="content">Cor / Pengecoran</td>
                <td class="label"></td>
                <td class="separator"></td>
                <td class="content"></td>
            </tr>
        </table>

        <table class="trans-table">
            <thead>
                <tr>
                    <th width="5%">NO</th>
                    <th width="45%">DESCRIPTION</th>
                    <th width="10%">Quantity</th>
                    <th width="10%">Unit</th>
                    <th width="15%">Unit Price</th>
                    <th width="15%">Value</th>
                </tr>
            </thead>
            <tbody>
                @php $no = 0; @endphp
                @foreach ($items as $item)
                    <tr>
                        <td class="text-center">
                            @if (empty($item['is_sub_item']))
                                @php $no++; @endphp
                                {{ $no }}
                            @endif
                        </td>
                        <td
                            style="{{ !empty($item['is_sub_item']) ? 'padding-left: 20px; font-style: italic;' : '' }}">
                            {{ $item['description'] }}
                        </td>
                        <td class="text-center">{{ number_format($item['volume'], 2, ',', '.') }}</td>
                        <td class="text-center">{{ $item['unit'] }}</td>
                        <td class="text-right">{{ number_format($item['unit_price'], 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($item['total_price'], 0, ',', '.') }}</td>
                    </tr>
                @endforeach

                @for ($i = count($items); $i < 10; $i++)
                    <tr>
                        <td class="text-center">{{ $i + 1 }}</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr>
                @endfor

                <tr class="total-row">
                    <td colspan="2" style="border:none; text-align:right; font-weight:bold; padding-right:10px;">
                        TOTAL VOLUME</td>
                    <td class="text-center" style="border:1px solid #000; font-weight:bold;">
                        {{ number_format($totalVolume, 2, ',', '.') }}
                    </td>
                    <td class="text-center" style="border:1px solid #000; font-weight:bold;">M3</td>
                    <td class="text-right">Jumlah</td>
                    <td class="text-right" style="border:1px solid #000;">{{ number_format($subtotal, 0, ',', '.') }}
                    </td>
                </tr>
                @if ($project->has_ppn)
                    <tr class="total-row">
                        <td colspan="4" style="border:none;"></td>
                        <td class="text-right">VAT 11%</td>
                        <td class="text-right" style="border:1px solid #000;">{{ number_format($ppn, 0, ',', '.') }}
                        </td>
                    </tr>
                @endif
                <tr class="total-row">
                    <td colspan="4" style="border:none;"></td>
                    <td class="text-right">D.P. / Pembayaran</td>
                    <td class="text-right" style="border:1px solid #000;">({{ number_format($dp, 0, ',', '.') }})
                    </td>
                </tr>
                <tr class="total-row">
                    <td colspan="4" style="border:none;"></td>
                    <td class="text-right" style="font-weight:bold;">Total</td>
                    <td class="text-right grand-total">IDR {{ number_format($grandTotal, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <div style="margin-bottom: 5px; font-weight: bold;">Invoice Amount :</div>
        <div class="terbilang-box">
            # {{ $terbilang }} #
        </div>

        <table class="footer-table" style="border-collapse: collapse; margin-top: 10px;">
            <tr>
                <td width="60%"
                    style="border: 1px solid #000; height: 18px; text-align: center; vertical-align: middle; background-color: #fff; font-weight: normal;">
                    Notes/ Signature
                </td>
                <td width="40%"
                    style="border: 1px solid #000; height: 18px; text-align: center; vertical-align: middle; background-color: #fff; font-weight: normal;">
                    AUTHORIZED SIGNED
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; height: 80px; vertical-align: top; padding: 5px;">
                    <!-- Area untuk catatan atau tanda tangan customer -->
                </td>
                <td
                    style="border: 1px solid #000; height: 80px; text-align: center; vertical-align: bottom; padding-bottom: 5px;">
                    <b><u>MASHURI</u></b><br>
                    Kepala Plant
                </td>
            </tr>
        </table>

        <div class="bank-info">
            *) Pembayaran Bilyet Giro Atau Cheq Dianggap Sah Bila Telah Dikliring/Dicairkan.<br>
            *) Pembayaran Dapat Dilakukan Pada :<br>
            &nbsp;&nbsp;&nbsp;<b>Bank BCA a/c : 131044155 (JAYA KARYA KONTRUKSI)</b>
        </div>

    </div>

</body>

</html>
