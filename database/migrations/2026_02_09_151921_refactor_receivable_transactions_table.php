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
        Schema::table('receivable_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('receivable_transactions', 'delivery_project_id')) {
                $table->foreignId('delivery_project_id')->nullable()->after('customer_id')->constrained('delivery_projects')->onDelete('cascade');
            }
            if (!Schema::hasColumn('receivable_transactions', 'type')) {
                $table->string('type')->default('payment')->after('delivery_project_id'); // payment, bill, discount
            }
            if (!Schema::hasColumn('receivable_transactions', 'amount')) {
                $table->decimal('amount', 15, 2)->default(0)->after('type');
            }

            // Cleanup old columns - only if they exist
            $columnsToDrop = [];
            foreach (['bill_amount', 'payment_amount', 'grade', 'volume', 'price_per_m3'] as $col) {
                if (Schema::hasColumn('receivable_transactions', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receivable_transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('delivery_project_id');
            $table->dropColumn(['type', 'amount']);

            $table->decimal('grade', 10, 2)->nullable();
            $table->decimal('volume', 10, 2)->nullable();
            $table->decimal('price_per_m3', 15, 2)->nullable();
            $table->decimal('bill_amount', 15, 2)->default(0);
            $table->decimal('payment_amount', 15, 2)->default(0);
        });
    }
};
