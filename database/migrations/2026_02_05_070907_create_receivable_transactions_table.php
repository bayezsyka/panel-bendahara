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
        Schema::create('receivable_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->date('date');
            $table->string('description');
            $table->string('grade')->nullable(); // Mutu beton/asphalt
            $table->decimal('volume', 10, 2)->nullable();
            $table->decimal('price_per_m3', 15, 2)->nullable();
            $table->decimal('bill_amount', 15, 2)->default(0); // Tagihan
            $table->decimal('payment_amount', 15, 2)->default(0); // Pembayaran
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('office_id')->default(1)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receivable_transactions');
    }
};
