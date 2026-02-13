<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlantTransaction;
use App\Models\CashSource;
use App\Models\CashExpenseType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PlantCashSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get a user for created_by
        $user = User::first();
        if (!$user) {
            $this->command->error('No user found. Please run UserSeeder or create a user first.');
            return;
        }

        // 2. Seed Cash Sources (Master Data)
        $sources = [
            'Kantor Utama (Dropping)',
            'Pencairan Cek Bank Mandiri',
            'Pencairan Cek Bank BCA',
            'Pengembalian Sisa Panjar',
            'Bunga Bank',
        ];

        $sourceModels = [];
        foreach ($sources as $name) {
            $sourceModels[] = CashSource::firstOrCreate(['name' => $name]);
        }

        // 3. Seed Cash Expense Types (Master Data)
        $expenseTypes = [
            'Gaji & Upah',
            'Biaya BBM & Pelumas',
            'Biaya Listrik & Air',
            'Biaya Komunikasi/Internet',
            'Alat Tulis Kantor (ATK)',
            'Biaya Konsumsi Rapat',
            'Biaya Perbaikan Mesin/Alat',
            'Biaya Keamanan & Kebersihan',
            'Biaya Perjalanan Dinas',
            'Biaya Lain-lain',
        ];

        $expenseTypeModels = [];
        foreach ($expenseTypes as $name) {
            $expenseTypeModels[] = CashExpenseType::firstOrCreate(['name' => $name]);
        }

        // 4. Generate Transactions for Jan & Feb
        $start = Carbon::create(2026, 1, 1);
        $end = Carbon::create(2026, 2, 15);

        $this->command->info("Seeding transactions from {$start->toDateString()} to {$end->toDateString()}...");

        DB::transaction(function () use ($start, $end, $user, $sourceModels, $expenseTypeModels) {
            $current = $start->copy();

            while ($current <= $end) {
                // Randomly decide if there's a transaction today
                // Every Monday: Dropping into Kas Besar
                if ($current->isMonday()) {
                    PlantTransaction::create([
                        'transaction_date' => $current->toDateString(),
                        'type' => 'in',
                        'cash_type' => 'kas_besar',
                        'amount' => 50000000, // 50 juta
                        'description' => 'Dropping dana mingguan dari Kantor Utama',
                        'cash_source_id' => $sourceModels[0]->id,
                        'created_by' => $user->id,
                    ]);
                }

                // Every Wednesday: Transfer from Kas Besar to Kas Kecil
                if ($current->isWednesday()) {
                    $transferAmount = 5000000; // 5 juta

                    // Out from Kas Besar
                    PlantTransaction::create([
                        'transaction_date' => $current->toDateString(),
                        'type' => 'out',
                        'cash_type' => 'kas_besar',
                        'amount' => $transferAmount,
                        'description' => 'Transfer dropping ke Kas Kecil (Biaya Operasional)',
                        'created_by' => $user->id,
                    ]);

                    // In to Kas Kecil
                    PlantTransaction::create([
                        'transaction_date' => $current->toDateString(),
                        'type' => 'in',
                        'cash_type' => 'kas_kecil',
                        'amount' => $transferAmount,
                        'description' => 'Dropping dari Kas Besar',
                        'created_by' => $user->id,
                    ]);
                }

                // Daily expenses (Random days)
                $numExpenses = rand(1, 3);
                for ($i = 0; $i < $numExpenses; $i++) {
                    // Decide if Kas Besar or Kas Kecil
                    $isKasKecil = rand(0, 100) > 30; // 70% chance it's kas kecil (usually more frequent small expenses)
                    $cashType = $isKasKecil ? 'kas_kecil' : 'kas_besar';
                    $amount = $isKasKecil ? rand(50000, 500000) : rand(1000000, 10000000);

                    $typeModel = $expenseTypeModels[array_rand($expenseTypeModels)];

                    PlantTransaction::create([
                        'transaction_date' => $current->toDateString(),
                        'type' => 'out',
                        'cash_type' => $cashType,
                        'amount' => $amount,
                        'description' => 'Biaya ' . $typeModel->name . ' - ' . $current->translatedFormat('d F'),
                        'cash_expense_type_id' => $typeModel->id,
                        'created_by' => $user->id,
                    ]);
                }

                $current->addDay();
            }
        });

        $this->command->info('Seeding finished!');
    }
}
