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
        Schema::table('plant_transactions', function (Blueprint $table) {
            // kas_besar = Kas Besar, kas_kecil = Kas Kecil
            $table->enum('cash_type', ['kas_besar', 'kas_kecil'])->default('kas_besar')->after('type')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plant_transactions', function (Blueprint $table) {
            $table->dropColumn('cash_type');
        });
    }
};
