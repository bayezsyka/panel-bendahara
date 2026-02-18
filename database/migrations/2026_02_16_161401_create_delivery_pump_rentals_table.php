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
        Schema::create('delivery_pump_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_project_id')->constrained('delivery_projects')->onDelete('cascade');
            $table->date('date');
            $table->string('docket_number')->nullable();

            // Basic Info
            $table->string('vehicle_number')->nullable(); // No Polisi Truk Pompa
            $table->string('driver_name')->nullable(); // Operator/Supir

            // Snapshot of Project Settings & Usage
            $table->decimal('rental_price', 15, 2)->default(0); // Base Price

            // Volume Logic
            $table->decimal('volume_pumped', 10, 2)->default(0); // Volume actual used
            $table->decimal('limit_volume', 10, 2)->default(0); // Limit from settings
            $table->decimal('over_volume_price', 15, 2)->default(0); // Price per m3 over limit

            // Pipe Logic
            $table->integer('pipes_used')->default(0); // Total pipes used
            $table->integer('limit_pipe')->default(0); // Limit pipes included
            $table->decimal('over_pipe_price', 15, 2)->default(0); // Price per pipe over limit

            // Total
            $table->decimal('total_price', 15, 2)->default(0); // Calculated total

            $table->text('notes')->nullable();
            $table->boolean('is_billed')->default(false);
            $table->unsignedBigInteger('office_id')->default(1)->index();
            $table->timestamps();

            $table->index(['delivery_project_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_pump_rentals');
    }
};
