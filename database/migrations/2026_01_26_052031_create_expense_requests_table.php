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
        Schema::create('expense_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('mandor_id')->constrained('mandors')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();

            // Sumber dan tipe input
            $table->enum('source', ['whatsapp'])->default('whatsapp')->index();
            $table->enum('input_type', ['receipt', 'nominal'])->index();

            // Data inti
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('transacted_at');

            // Bukti / detail
            $table->string('receipt_image')->nullable();
            $table->json('items')->nullable(); // array item hasil AI

            // Status approval bendahara
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();

            $table->foreignId('expense_id')->nullable()->constrained('expenses')->nullOnDelete();

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();

            $table->text('review_note')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_requests');
    }
};
