<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\ExpenseType;

class CompleteProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus data lama jika ada (gunakan delete untuk avoid foreign key issues)
        $this->command->info('Membersihkan data lama...');
        ExpenseItem::query()->delete();
        Expense::query()->delete();
        DB::table('mandor_project')->delete();
        Project::query()->delete();

        // Buat 3 projects
        $this->command->info('Membuat projects...');
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

        // Data material bangunan yang realistis
        $materials = [
            ['name' => 'Semen Gresik 50kg', 'min_qty' => 10, 'max_qty' => 100, 'min_price' => 65000, 'max_price' => 70000],
            ['name' => 'Pasir Cor per m³', 'min_qty' => 2, 'max_qty' => 10, 'min_price' => 350000, 'max_price' => 400000],
            ['name' => 'Batu Split per m³', 'min_qty' => 2, 'max_qty' => 8, 'min_price' => 400000, 'max_price' => 450000],
            ['name' => 'Besi Beton 10mm', 'min_qty' => 20, 'max_qty' => 100, 'min_price' => 85000, 'max_price' => 95000],
            ['name' => 'Bata Merah per 1000', 'min_qty' => 1, 'max_qty' => 5, 'min_price' => 800000, 'max_price' => 900000],
            ['name' => 'Genteng Keramik', 'min_qty' => 50, 'max_qty' => 200, 'min_price' => 8000, 'max_price' => 12000],
            ['name' => 'Cat Tembok Avian 25kg', 'min_qty' => 2, 'max_qty' => 10, 'min_price' => 450000, 'max_price' => 500000],
            ['name' => 'Keramik Lantai 40x40', 'min_qty' => 20, 'max_qty' => 100, 'min_price' => 45000, 'max_price' => 65000],
            ['name' => 'Pipa PVC 3 inch', 'min_qty' => 5, 'max_qty' => 20, 'min_price' => 85000, 'max_price' => 95000],
            ['name' => 'Triplek 9mm', 'min_qty' => 5, 'max_qty' => 30, 'min_price' => 120000, 'max_price' => 140000],
        ];

        $peralatan = [
            ['name' => 'Sewa Molen 1 Hari', 'min_qty' => 1, 'max_qty' => 3, 'min_price' => 250000, 'max_price' => 350000],
            ['name' => 'Sewa Scaffolding per Set', 'min_qty' => 1, 'max_qty' => 5, 'min_price' => 150000, 'max_price' => 200000],
            ['name' => 'Bor Listrik Bosch', 'min_qty' => 1, 'max_qty' => 2, 'min_price' => 850000, 'max_price' => 1200000],
            ['name' => 'Gerinda Tangan', 'min_qty' => 1, 'max_qty' => 3, 'min_price' => 450000, 'max_price' => 650000],
            ['name' => 'Meteran Laser', 'min_qty' => 1, 'max_qty' => 2, 'min_price' => 350000, 'max_price' => 500000],
            ['name' => 'Tangga Lipat Aluminium', 'min_qty' => 1, 'max_qty' => 2, 'min_price' => 650000, 'max_price' => 850000],
            ['name' => 'Ember Cor 40L', 'min_qty' => 5, 'max_qty' => 15, 'min_price' => 45000, 'max_price' => 65000],
        ];

        $upah = [
            ['name' => 'Upah Tukang Batu per Hari', 'min_qty' => 1, 'max_qty' => 5, 'min_price' => 200000, 'max_price' => 250000],
            ['name' => 'Upah Tukang Kayu per Hari', 'min_qty' => 1, 'max_qty' => 4, 'min_price' => 200000, 'max_price' => 250000],
            ['name' => 'Upah Tukang Cat per Hari', 'min_qty' => 1, 'max_qty' => 3, 'min_price' => 180000, 'max_price' => 220000],
            ['name' => 'Upah Kuli Bangunan per Hari', 'min_qty' => 2, 'max_qty' => 8, 'min_price' => 150000, 'max_price' => 180000],
            ['name' => 'Upah Tukang Las per Hari', 'min_qty' => 1, 'max_qty' => 2, 'min_price' => 250000, 'max_price' => 300000],
        ];

        $bbm = [
            ['name' => 'Bensin Pertalite', 'min_qty' => 10, 'max_qty' => 50, 'min_price' => 10000, 'max_price' => 11000],
            ['name' => 'Solar', 'min_qty' => 20, 'max_qty' => 100, 'min_price' => 6800, 'max_price' => 7500],
            ['name' => 'Oli Mesin SAE 40', 'min_qty' => 2, 'max_qty' => 10, 'min_price' => 45000, 'max_price' => 55000],
        ];

        $toko = [
            'TB. Sinar Jaya',
            'Toko Bangunan Maju Jaya',
            'UD. Berkah Material',
            'CV. Karya Mandiri',
            'Toko Besi Sejahtera',
            'UD. Mitra Bangunan',
            'TB. Cahaya Abadi',
            'Toko Material Sentosa',
        ];

        // Ambil semua expense types
        $expenseTypes = ExpenseType::all();

        if ($expenseTypes->isEmpty()) {
            $this->command->error('Expense types tidak ditemukan!');
            return;
        }

        $this->command->info('Membuat expenses...');

        $allProjects = Project::all();

        foreach ($allProjects as $project) {
            // Buat 20-35 expenses per project
            $expenseCount = rand(20, 35);

            for ($i = 0; $i < $expenseCount; $i++) {
                // Random expense type
                $expenseType = $expenseTypes->random();

                // Pilih items berdasarkan tipe
                $itemsPool = [];
                switch ($expenseType->id) {
                    case 1: // BBM
                        $itemsPool = $bbm;
                        break;
                    case 2: // Peralatan
                        $itemsPool = array_merge($peralatan, $upah);
                        break;
                    case 3: // Material
                        $itemsPool = $materials;
                        break;
                    case 4: // Upah
                        $itemsPool = $upah;
                        break;
                    default:
                        $itemsPool = array_merge($materials, $peralatan, $upah, $bbm);
                }

                // Random tanggal dalam 60 hari terakhir
                $daysAgo = rand(0, 60);
                $transactedAt = now()->subDays($daysAgo)->format('Y-m-d');

                // Buat expense
                $expense = Expense::create([
                    'project_id' => $project->id,
                    'expense_type_id' => $expenseType->id,
                    'title' => $toko[array_rand($toko)],
                    'description' => rand(0, 100) > 70 ? 'Pembelian untuk kebutuhan ' . strtolower($expenseType->name) : null,
                    'transacted_at' => $transactedAt,
                    'amount' => 0,
                ]);

                // Buat 1-5 items per expense
                $itemCount = rand(1, 5);
                $totalAmount = 0;

                for ($j = 0; $j < $itemCount; $j++) {
                    $item = $itemsPool[array_rand($itemsPool)];
                    $qty = rand($item['min_qty'], $item['max_qty']);
                    $price = rand($item['min_price'], $item['max_price']);
                    $total = $qty * $price;

                    ExpenseItem::create([
                        'expense_id' => $expense->id,
                        'name' => $item['name'],
                        'quantity' => $qty,
                        'price' => $price,
                        'total_price' => $total,
                    ]);

                    $totalAmount += $total;
                }

                // Update total amount
                $expense->update(['amount' => $totalAmount]);
            }

            $this->command->info("✓ {$project->name}: {$expenseCount} expenses");
        }

        $this->command->info('');
        $this->command->info('🎉 SELESAI!');
        $this->command->info('📊 Total Projects: ' . Project::count());
        $this->command->info('📝 Total Expenses: ' . Expense::count());
        $this->command->info('💰 Total Pengeluaran: Rp ' . number_format(Expense::sum('amount'), 0, ',', '.'));
    }
}
