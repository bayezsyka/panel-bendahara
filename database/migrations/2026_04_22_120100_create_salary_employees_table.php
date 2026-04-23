<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_company_id')->constrained('salary_companies')->cascadeOnDelete();
            $table->string('name');
            $table->string('nik')->nullable();
            $table->string('jabatan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['salary_company_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_employees');
    }
};
