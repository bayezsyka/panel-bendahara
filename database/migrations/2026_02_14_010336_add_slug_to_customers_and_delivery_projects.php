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
        // Add slug to customers
        if (Schema::hasTable('customers') && !Schema::hasColumn('customers', 'slug')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->string('slug')->after('name')->nullable();
            });

            // Populate existing slugs for customers
            $customers = DB::table('customers')->get();
            foreach ($customers as $customer) {
                $slug = Str::slug($customer->name);
                $originalSlug = $slug;
                $count = 1;
                while (DB::table('customers')->where('slug', $slug)->where('id', '!=', $customer->id)->exists()) {
                    $slug = $originalSlug . '-' . $count++;
                }
                DB::table('customers')->where('id', $customer->id)->update(['slug' => $slug]);
            }

            // Change to not null and unique
            Schema::table('customers', function (Blueprint $table) {
                $table->string('slug')->nullable(false)->unique()->change();
            });
        }

        // Add slug to delivery_projects
        if (Schema::hasTable('delivery_projects') && !Schema::hasColumn('delivery_projects', 'slug')) {
            Schema::table('delivery_projects', function (Blueprint $table) {
                $table->string('slug')->after('name')->nullable();
            });

            // Populate existing slugs for delivery_projects
            $projects = DB::table('delivery_projects')->get();
            foreach ($projects as $project) {
                $slug = Str::slug($project->name);
                $originalSlug = $slug;
                $count = 1;
                while (DB::table('delivery_projects')->where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                    $slug = $originalSlug . '-' . $count++;
                }
                DB::table('delivery_projects')->where('id', $project->id)->update(['slug' => $slug]);
            }

            // Change to not null and unique
            Schema::table('delivery_projects', function (Blueprint $table) {
                $table->string('slug')->nullable(false)->unique()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('customers') && Schema::hasColumn('customers', 'slug')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }

        if (Schema::hasTable('delivery_projects') && Schema::hasColumn('delivery_projects', 'slug')) {
            Schema::table('delivery_projects', function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }
    }
};
