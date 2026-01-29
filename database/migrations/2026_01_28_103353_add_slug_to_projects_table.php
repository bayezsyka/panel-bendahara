<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->after('name')->nullable();
        });

        // Populate existing slugs
        $projects = DB::table('projects')->get();
        foreach ($projects as $project) {
            $slug = Str::slug($project->name) . '-' . $project->id; // Append ID to ensure uniqueness initially
            DB::table('projects')->where('id', $project->id)->update(['slug' => $slug]);
        }

        // Change to not null and unique
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
