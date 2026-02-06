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
        Schema::create('plant_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('transaction_date')->index();
            $table->enum('type', ['in', 'out'])->index(); // in = Kas Masuk, out = Kas Keluar
            $table->decimal('amount', 15, 2);
            $table->text('description');

            // Relation to ExpenseType (Reusing existing or new? "Tipe Biaya" typically generic)
            // User requested "Kita bikin ada" (Make it exist). 
            // I will link to existing expense_types, but assuming we might filter them later or just allow all.
            // Using unsignedBigInteger and nullable.
            $table->foreignId('expense_type_id')->nullable()->constrained('expense_types')->nullOnDelete();

            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plant_transactions');
    }
};
