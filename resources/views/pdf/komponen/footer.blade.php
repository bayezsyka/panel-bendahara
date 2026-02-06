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
        border-top: 0.7px solid #ddd;
        padding-top: 6px;
        font-family: Arial, Helvetica, sans-serif;
    }

    .footer-left {
        float: left;
        max-width: 70%;
    }

    .footer-right {
        float: right;
        text-align: right;
        white-space: nowrap;
    }

    .footer-muted {
        color: #888;
        font-style: italic;
    }
</style>

<div id="pdf-footer">
    <div class="footer-left">
        <strong>Dicetak oleh</strong><br>
        <span>{{ Auth::user()->name }}</span>
    </div>

    <div class="footer-right">
        Waktu cetak<br>
        <strong>
            {{ \Carbon\Carbon::now('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB
        </strong>
    </div>
</div>
