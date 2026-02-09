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
        Schema::table('concrete_grades', function (Blueprint $table) {
            if (Schema::hasColumn('concrete_grades', 'name')) {
                $table->renameColumn('name', 'code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('concrete_grades', function (Blueprint $table) {
            if (Schema::hasColumn('concrete_grades', 'code')) {
                $table->renameColumn('code', 'name');
            }
        });
    }
};
