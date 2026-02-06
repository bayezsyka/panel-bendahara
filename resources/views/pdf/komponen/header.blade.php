<style>
    .kop {
        width: 100%;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 15px;
    }

    .kop-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        /* Penting untuk presisi lebar kolom */
    }

    .company {
        font-size: 17px;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 2px;
    }

    .text-center {
        text-align: center;
    }
</style>

<div class="kop">
    <table class="kop-table">
        <tr>
            <!-- Kolom Kiri untuk Logo -->
            <td style="width: 20%; text-align: left; vertical-align: middle;">
                <img src="{{ public_path('images/logo.png') }}" style="height: 60px;">
            </td>

            <!-- Kolom Tengah untuk Teks (Pusat Halaman) -->
            <td class="text-center" style="width: 60%; vertical-align: middle;">
                <div class="company">PT. JAYA KARYA KONTRUKSI</div>
                <div style="font-size: 11px; color: #333;">General Contractor & Supplier</div>
            </td>

            <!-- Kolom Kanan Kosong (Penyeimbang agar Tengah tetap di Tengah) -->
            <td style="width: 20%;"></td>
        </tr>
    </table>
</div>
