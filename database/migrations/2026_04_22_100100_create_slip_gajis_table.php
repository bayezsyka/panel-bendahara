<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slip_gajis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('employee_name');
            $table->string('employee_nik')->nullable();
            $table->string('employee_position');
            $table->string('status')->default('Karyawan Tetap');
            $table->string('periode');
            $table->date('tanggal_tf_cash');
            $table->decimal('gaji_pokok', 15, 2);
            $table->decimal('uang_makan', 15, 2)->default(0);
            $table->decimal('uang_lembur', 15, 2)->default(0);
            $table->decimal('bpjs_kesehatan', 15, 2)->default(0);
            $table->decimal('bpjs_ketenagakerjaan', 15, 2)->default(0);
            $table->decimal('pph21', 15, 2)->default(0);
            $table->decimal('pendapatan_bersih', 15, 2);
            $table->string('tempat_tanggal_ttd');
            $table->string('penerima');
            $table->string('direktur')->default('Direktur Utama');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'tanggal_tf_cash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slip_gajis');
    }
};
