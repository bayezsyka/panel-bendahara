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
            $table->dropForeign(['expense_type_id']);
            $table->dropColumn('expense_type_id');

            $table->foreignId('cash_source_id')->nullable()->constrained('cash_sources')->nullOnDelete();
            $table->foreignId('cash_expense_type_id')->nullable()->constrained('cash_expense_types')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plant_transactions', function (Blueprint $table) {
            $table->dropForeign(['cash_source_id']);
            $table->dropColumn('cash_source_id');

            $table->dropForeign(['cash_expense_type_id']);
            $table->dropColumn('cash_expense_type_id');

            $table->foreignId('expense_type_id')->nullable()->constrained('expense_types')->nullOnDelete();
        });
    }
};
