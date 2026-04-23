<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->foreignId('salary_employee_id')
                ->nullable()
                ->after('salary_company_id')
                ->constrained('salary_employees')
                ->nullOnDelete();

            $table->string('period_month', 7)
                ->nullable()
                ->after('periode');

            $table->index(['salary_company_id', 'salary_employee_id', 'period_month'], 'slip_gajis_company_employee_period_index');
        });
    }

    public function down(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->dropIndex('slip_gajis_company_employee_period_index');
            $table->dropConstrainedForeignId('salary_employee_id');
            $table->dropColumn('period_month');
        });
    }
};
