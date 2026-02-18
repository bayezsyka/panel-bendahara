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
        Schema::table('delivery_projects', function (Blueprint $table) {
            $table->decimal('pump_rental_price', 15, 2)->default(0)->after('default_concrete_grade_id');
            $table->decimal('pump_limit_volume', 10, 2)->default(0)->after('pump_rental_price'); // Limit Volume (M3)
            $table->decimal('pump_over_volume_price', 15, 2)->default(0)->after('pump_limit_volume');
            $table->integer('pump_limit_pipe')->default(0)->after('pump_over_volume_price'); // Limit Pipa (Batang)
            $table->decimal('pump_over_pipe_price', 15, 2)->default(0)->after('pump_limit_pipe');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_projects', function (Blueprint $table) {
            $table->dropColumn([
                'pump_rental_price',
                'pump_limit_volume',
                'pump_over_volume_price',
                'pump_limit_pipe',
                'pump_over_pipe_price',
            ]);
        });
    }
};
