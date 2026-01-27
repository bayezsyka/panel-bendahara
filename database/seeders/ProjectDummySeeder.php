<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;

class ProjectDummySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'name' => 'Renovasi Dapur MBG',
                'description' => 'Proyek renovasi dapur untuk meningkatkan fasilitas dan kenyamanan',
                'status' => 'ongoing',
                'location' => 'Jl. Merdeka No. 123, Jakarta Pusat',
                'coordinates' => '-6.2088,106.8456',
            ],
            [
                'name' => 'Pembangunan Gudang Penyimpanan',
                'description' => 'Konstruksi gudang baru untuk penyimpanan material dan peralatan',
                'status' => 'ongoing',
                'location' => 'Kawasan Industri Cikarang, Bekasi',
                'coordinates' => '-6.2615,107.1537',
            ],
            [
                'name' => 'Perbaikan Atap Kantor',
                'description' => 'Perbaikan dan penggantian atap kantor yang bocor',
                'status' => 'completed',
                'location' => 'Jl. Sudirman No. 45, Jakarta Selatan',
                'coordinates' => '-6.2088,106.8229',
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }

        $this->command->info('3 project dummy berhasil dibuat!');
    }
}
