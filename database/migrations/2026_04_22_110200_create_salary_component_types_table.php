<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_component_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['income', 'deduction']);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['name', 'type']);
        });

        $now = now();

        DB::table('salary_component_types')->insert([
            [
                'name' => 'Gaji Pokok',
                'type' => 'income',
                'description' => 'Komponen gaji dasar.',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Uang Makan',
                'type' => 'income',
                'description' => 'Tunjangan makan.',
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Lembur',
                'type' => 'income',
                'description' => 'Tambahan lembur.',
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'BPJS Kesehatan',
                'type' => 'deduction',
                'description' => 'Potongan BPJS kesehatan.',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'BPJS Ketenagakerjaan',
                'type' => 'deduction',
                'description' => 'Potongan BPJS ketenagakerjaan.',
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'PPh 21',
                'type' => 'deduction',
                'description' => 'Potongan pajak penghasilan.',
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_component_types');
    }
};
