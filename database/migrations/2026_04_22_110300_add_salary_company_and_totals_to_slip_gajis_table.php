<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->foreignId('salary_company_id')->nullable()->after('user_id')->constrained('salary_companies')->nullOnDelete();
            $table->decimal('total_pendapatan', 15, 2)->default(0)->after('pph21');
            $table->decimal('total_potongan', 15, 2)->default(0)->after('total_pendapatan');
        });
    }

    public function down(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->dropConstrainedForeignId('salary_company_id');
            $table->dropColumn(['total_pendapatan', 'total_potongan']);
        });
    }
};
