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
        if (!Schema::hasColumn('delivery_shipments', 'is_billed')) {
            Schema::table('delivery_shipments', function (Blueprint $table) {
                $table->boolean('is_billed')->default(false)->after('notes');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_shipments', function (Blueprint $table) {
            //
        });
    }
};
