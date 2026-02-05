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
        Schema::create('concrete_grades', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama Mutu (K-225, K-300)
            $table->decimal('price', 15, 2)->default(0);
            $table->string('description')->nullable();
            $table->unsignedBigInteger('office_id')->default(1)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('concrete_grades');
    }
};
