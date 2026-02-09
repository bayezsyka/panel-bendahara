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
        Schema::create('delivery_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_project_id')->constrained('delivery_projects')->onDelete('cascade');
            $table->foreignId('concrete_grade_id')->nullable()->constrained('concrete_grades')->nullOnDelete();
            $table->date('date');
            $table->string('docket_number'); // DN (Docket Number)
            $table->integer('rit_number'); // No. RIT
            $table->string('slump')->nullable(); // Slump (e.g., "12 ± 2")
            $table->decimal('volume', 10, 2); // Jumlah Volume (M3)
            $table->string('vehicle_number')->nullable(); // No. Polisi
            $table->string('driver_name')->nullable(); // Supir
            $table->decimal('price_per_m3', 15, 2)->nullable(); // Harga per kubik (custom per pengiriman)
            $table->decimal('total_price', 15, 2)->nullable(); // Total harga (volume * price)
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
        Schema::dropIfExists('delivery_shipments');
    }
};
