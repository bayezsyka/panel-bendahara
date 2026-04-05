<style>
    @page {
        margin: 1.5cm 1.5cm 2.2cm 1.5cm;
    }

    #pdf-footer {
        position: fixed;
        bottom: -1.2cm;
        left: 0;
        right: 0;
        height: 1.2cm;
        font-size: 8.5px;
        color: #555;
        border-top: 1px solid #eee;
        padding-top: 8px;
        font-family: Arial, Helvetica, sans-serif;
    }

    .footer-table {
        width: 100%;
        border-collapse: collapse;
        border: none;
    }

    .footer-table td {
        vertical-align: top;
        padding: 0;
        border: none;
    }

    .f-label {
        font-weight: bold;
        color: #333;
        margin-bottom: 2px;
    }

    .f-value {
        color: #666;
    }

    .f-right {
        text-align: right;
    }
</style>

<div id="pdf-footer">
    <table class="footer-table">
        <tr>
            <td>
                <div class="f-label">Dicetak oleh</div>
                <div class="f-value">{{ Auth::user()->name }}</div>
            </td>
            <td class="f-right">
                <div class="f-label">Waktu cetak</div>
                <div class="f-value">
                    {{ \Carbon\Carbon::now('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB
                </div>
            </td>
        </tr>
    </table>
</div>
