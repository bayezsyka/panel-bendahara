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
        Schema::create('delivery_trucks', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_number')->unique();
            $table->string('driver_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('office_id')->default(1)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_trucks');
    }
};
