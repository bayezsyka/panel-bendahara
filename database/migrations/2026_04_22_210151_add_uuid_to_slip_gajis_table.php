<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id')->unique();
        });

        // Update existing records
        $records = DB::table('slip_gajis')->get();
        foreach ($records as $record) {
            DB::table('slip_gajis')
                ->where('id', $record->id)
                ->update(['uuid' => Str::uuid()->toString()]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slip_gajis', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
