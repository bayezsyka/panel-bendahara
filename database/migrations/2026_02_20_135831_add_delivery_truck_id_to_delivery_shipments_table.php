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
        Schema::table('delivery_shipments', function (Blueprint $table) {
            $table->foreignId('delivery_truck_id')->nullable()->after('concrete_grade_id')->constrained('delivery_trucks')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_shipments', function (Blueprint $table) {
            $table->dropForeign(['delivery_truck_id']);
            $table->dropColumn('delivery_truck_id');
        });
    }
};
