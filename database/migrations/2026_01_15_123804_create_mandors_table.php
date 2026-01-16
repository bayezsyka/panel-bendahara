<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Buat Tabel Mandor
        Schema::create('mandors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('whatsapp_number')->unique(); // Format: 628xxxx
            $table->timestamps();
        });

        // 2. Tambah Relasi ke Tabel Projects
        Schema::table('projects', function (Blueprint $table) {
            // nullable: karena bisa saja proyek belum ada mandornya
            // onDelete('set null'): jika mandor dihapus, proyek tidak ikut terhapus (hanya kolom mandor_id jadi null)
            $table->foreignId('mandor_id')
                ->nullable()
                ->after('coordinates') // Opsional: letakkan setelah kolom coordinates
                ->constrained('mandors')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus relasi dulu
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['mandor_id']);
            $table->dropColumn('mandor_id');
        });

        // Baru hapus tabel
        Schema::dropIfExists('mandors');
    }
};
