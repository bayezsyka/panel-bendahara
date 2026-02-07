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
        Schema::table('projects', function (Blueprint $table) {
            // Index composite untuk optimasi filter status dengan OfficeScope
            $table->index(['office_id', 'status']);
            $table->index('mandor_id');
        });

        Schema::table('expenses', function (Blueprint $table) {
            // Index composite untuk optimasi filter tanggal dengan OfficeScope (Dashboard)
            $table->index(['office_id', 'transacted_at']);

            // Index untuk foreign keys dan sorting
            $table->index('project_id');
            $table->index('expense_type_id');
        });

        Schema::table('receivable_transactions', function (Blueprint $table) {
            $table->index(['office_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['office_id', 'status']);
            $table->dropIndex(['mandor_id']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['office_id', 'transacted_at']);
            $table->dropIndex(['project_id']);
            $table->dropIndex(['expense_type_id']);
        });

        Schema::table('receivable_transactions', function (Blueprint $table) {
            $table->dropIndex(['office_id', 'date']);
        });
    }
};
