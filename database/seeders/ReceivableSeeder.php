<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\ReceivableTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ReceivableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat User Admin & Staff Kantor
        User::updateOrCreate(
            ['email' => 'a@a.com'],
            [
                'name' => 'Superadmin',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
                'office_id' => 1,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'kantor@jkk.com'],
            [
                'name' => 'Bendahara Utama',
                'password' => Hash::make('password'),
                'role' => 'bendahara_utama',
                'office_id' => 1,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'plant@jkk.com'],
            [
                'name' => 'Admin Plant',
                'password' => Hash::make('password'),
                'role' => 'admin_plant',
                'office_id' => 2,
                'is_active' => true,
            ]
        );

        // 2. Data Pelanggan (Customers)
        $customers = [
            [
                'name' => 'PT. Jaya Konstruksi',
                'contact' => '081234567890',
                'office_id' => 1,
            ],
            [
                'name' => 'CV. Bangun Sejahtera',
                'contact' => '082233445566',
                'office_id' => 1,
            ],
            [
                'name' => 'Bpk. Ahmad Subarjo',
                'contact' => '085566778899',
                'office_id' => 1,
            ],
            [
                'name' => 'PT. Infrastruktur Utama',
                'contact' => '081122334455',
                'office_id' => 1,
            ],
        ];

        foreach ($customers as $custData) {
            $customer = Customer::create($custData);

            // 3. Tambahkan Transaksi untuk setiap Customer

            // Contoh: Transaksi Tagihan (Bill)
            $vol = rand(10, 50);
            $price = 850000;
            ReceivableTransaction::create([
                'customer_id' => $customer->id,
                'date' => Carbon::now()->subDays(rand(10, 30)),
                'description' => 'Pengiriman Beton K-300 - Proyek A',
                'grade' => 'K-300',
                'volume' => $vol,
                'price_per_m3' => $price,
                'bill_amount' => $vol * $price,
                'payment_amount' => 0,
                'notes' => 'Invoice #00' . rand(1, 9),
                'office_id' => 1,
            ]);

            // Tambahkan pembayaran parsial untuk sebagian customer
            if (rand(0, 1)) {
                ReceivableTransaction::create([
                    'customer_id' => $customer->id,
                    'date' => Carbon::now()->subDays(rand(1, 5)),
                    'description' => 'Pembayaran Tahap 1',
                    'bill_amount' => 0,
                    'payment_amount' => ($vol * $price) / 2,
                    'notes' => 'Transfer Bank',
                    'office_id' => 1,
                ]);
            }

            // Tambahkan transaksi kedua agar data terlihat bervariasi
            $vol2 = rand(5, 20);
            $price2 = 900000;
            ReceivableTransaction::create([
                'customer_id' => $customer->id,
                'date' => Carbon::now()->subDays(rand(5, 15)),
                'description' => 'Pengiriman Beton K-350 - Proyek B',
                'grade' => 'K-350',
                'volume' => $vol2,
                'price_per_m3' => $price2,
                'bill_amount' => $vol2 * $price2,
                'payment_amount' => 0,
                'notes' => 'Invoice #0' . rand(10, 20),
                'office_id' => 1,
            ]);
        }
    }
}
