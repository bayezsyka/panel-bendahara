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
        Schema::table('delivery_projects', function (Blueprint $table) {
            $table->boolean('has_ppn')->default(false)->after('default_concrete_grade_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_projects', function (Blueprint $table) {
            $table->dropColumn('has_ppn');
        });
    }
};
