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
        if (!Schema::hasTable('delivery_projects')) {
            Schema::create('delivery_projects', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
                $table->string('code')->nullable(); // Kode Proyek
                $table->string('name'); // Nama Proyek
                $table->string('sub_contractor')->nullable(); // Nama Penerima / Sub-Con
                $table->text('location')->nullable(); // Alamat Proyek
                $table->string('contact_person')->nullable(); // Lapangan
                $table->string('work_type')->nullable(); // Pekerjaan: cor/rigid
                $table->foreignId('default_concrete_grade_id')->nullable()->constrained('concrete_grades')->nullOnDelete();
                $table->unsignedBigInteger('office_id')->default(1)->index();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_projects');
    }
};
