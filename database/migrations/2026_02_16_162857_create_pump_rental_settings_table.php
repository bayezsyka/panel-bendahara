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
        Schema::create('pump_rental_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('pump_rental_price', 15, 2)->default(0);
            $table->decimal('pump_limit_volume', 8, 2)->default(0);
            $table->decimal('pump_over_volume_price', 15, 2)->default(0);
            $table->integer('pump_limit_pipe')->default(0);
            $table->decimal('pump_over_pipe_price', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pump_rental_settings');
    }
};
