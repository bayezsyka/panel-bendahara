<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slip_gaji_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slip_gaji_id')->constrained()->cascadeOnDelete();
            $table->foreignId('salary_component_type_id')->nullable()->constrained('salary_component_types')->nullOnDelete();
            $table->string('component_name');
            $table->enum('component_type', ['income', 'deduction']);
            $table->decimal('amount', 15, 2)->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slip_gaji_items');
    }
};
