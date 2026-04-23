<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->boolean('is_finalized')->default(true)->after('period_month');
        });
    }

    public function down(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->dropColumn('is_finalized');
        });
    }
};
