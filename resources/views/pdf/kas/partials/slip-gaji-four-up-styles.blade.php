@php
    $slipLayout = $slipLayout ?? 'six-up';
    $isSixUp = $slipLayout === 'six-up';
    $isSingle = $slipLayout === 'single';

    if ($isSixUp) {
        $slotWidthMm = 99; // 297 / 3
        $slotHeightMm = 105; // 210 / 2
        $sheetWidthMm = 297;
        $sheetHeightMm = 210;
        $pageMarginMm = 0;
    } else {
        $slotWidthMm = 105;
        $slotHeightMm = $slotHeightMm ?? 112;
        $sheetWidthMm = $isSingle ? $slotWidthMm : 210;
        $sheetHeightMm = $slotHeightMm;
        $pageMarginMm = 0;
    }

    $slipWidthMm = $slotWidthMm - 4.9;
    $slipHeightMm = $slotHeightMm - 4.9;
@endphp

<style>
    @page {
        margin: {{ $pageMarginMm }}mm;
    }

    * {
        box-sizing: border-box;
    }

    html,
    body {
        margin: 0;
        padding: 0;
    }

    body {
        font-family: Arial, sans-serif;
        color: #000;
        font-size: {{ $isSixUp ? '6.5px' : '8.4px' }};
        background: #ffffff;
    }

    .sheet {
        position: relative;
        page-break-after: always;
        width: {{ $sheetWidthMm }}mm;
        height: {{ $sheetHeightMm }}mm;
    }

    .sheet:last-child {
        page-break-after: auto;
    }

    .slot {
        position: absolute;
        width: {{ $slotWidthMm }}mm;
        height: {{ $slotHeightMm }}mm;
        padding: 0;
        overflow: hidden;
    }

    .slot-1 {
        left: 0;
        top: 0;
    }

    .slot-2 {
        left: {{ $slotWidthMm }}mm;
        top: 0;
    }

    .slot-3 {
        left: {{ $slotWidthMm * 2 }}mm;
        top: 0;
    }

    .slot-4 {
        left: 0;
        top: {{ $slotHeightMm }}mm;
    }

    .slot-5 {
        left: {{ $slotWidthMm }}mm;
        top: {{ $slotHeightMm }}mm;
    }

    .slot-6 {
        left: {{ $slotWidthMm * 2 }}mm;
        top: {{ $slotHeightMm }}mm;
    }

    .salary-slip {
        position: relative;
        box-sizing: content-box;
        width: {{ $slipWidthMm }}mm;
        height: {{ $slipHeightMm }}mm;
        overflow: hidden;
        border: 0.25mm solid #222;
        padding: 2.2mm;
        background: #fff;
    }

    .slip-kop {
        width: 100%;
        border-bottom: 0.35mm solid #000;
        padding-bottom: 2mm;
        margin-bottom: 2mm;
    }

    .slip-kop-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }

    .slip-logo-cell {
        width: 20%;
        text-align: left;
        vertical-align: middle;
    }

    .slip-logo {
        height: 9.5mm;
        max-width: 100%;
    }

    .slip-company-cell {
        width: 60%;
        text-align: center;
        vertical-align: middle;
    }

    .slip-company {
        font-size: 11px;
        font-weight: bold;
        line-height: 1.15;
        text-transform: uppercase;
    }

    .slip-subtitle {
        margin-top: 0.5mm;
        font-size: 7px;
        line-height: 1.1;
        color: #333;
    }

    .slip-balance-cell {
        width: 20%;
    }

    .main-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }

    .main-table td,
    .main-table th {
        padding: 1.4px 2px;
        vertical-align: top;
        line-height: 1.2;
        word-wrap: break-word;
    }

    .title-row {
        text-align: center;
        font-weight: bold;
        font-size: 9px;
        padding-bottom: 4px !important;
    }

    .bold {
        font-weight: bold;
    }

    .text-right {
        text-align: right;
    }

    .text-center {
        text-align: center;
    }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-top: 2mm;
    }

    .items-table td,
    .items-table th {
        border: 1px solid #000;
        padding: 1.4px 2px;
        vertical-align: middle;
        line-height: 1.18;
        word-wrap: break-word;
    }

    .amount-cell {
        white-space: nowrap;
    }

    .signature-date {
        text-align: right;
        margin-top: 0;
        margin-bottom: 1mm;
        margin-right: 10%;
        font-weight: bold;
    }

    .signature-footer {
        margin-top: 2mm;
        width: 100%;
    }

    .signature-box {
        margin-top: 0;
        page-break-inside: avoid;
    }

    .signature-table {
        width: 80%;
        border-collapse: collapse;
        margin-left: 10%;
    }

    .signature-table td {
        width: 50%;
        border: 1px solid #000;
        text-align: center;
        vertical-align: top;
    }

    .td-label {
        padding: 2px 1px;
        font-weight: bold;
    }

    .td-space {
        height: 10mm;
    }

    .td-name {
        padding: 2px 1px;
        text-align: center;
    }

    .sign-name-block {
        display: inline-block;
        text-align: center;
    }

    .sign-name-block .nama {
        display: block;
        font-size: 8px;
        font-weight: bold;
        text-decoration: underline;
    }

    .sign-name-block .jabatan {
        display: block;
        font-size: 7px;
        margin-top: 1px;
    }
</style>
