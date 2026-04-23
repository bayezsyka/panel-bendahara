<?php

namespace Tests\Feature;

use App\Models\SalaryCompany;
use App\Models\SalaryEmployee;
use App\Models\SlipGaji;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SlipGajiControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_page_loads_selected_employee_without_server_error(): void
    {
        $user = User::factory()->superadmin()->create();
        $company = SalaryCompany::query()->create([
            'name' => 'PT. Marko Jaya',
            'direktur' => 'Marko Simic',
            'is_active' => true,
        ]);
        $employee = SalaryEmployee::query()->create([
            'salary_company_id' => $company->id,
            'name' => 'Budi Santoso',
            'nik' => '1234567890',
            'jabatan' => 'Staff Finance',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/slip-gaji/create?employee='.$employee->uuid.'&month=2026-04');

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Kas/SlipGaji/Create')
                ->where('selectedMonth', '2026-04')
                ->where('selectedCompany.name', 'PT. Marko Jaya')
                ->where('selectedCompany.direktur', 'Marko Simic')
                ->where('initialForm.employee_id', $employee->uuid)
                ->where('initialForm.status', 'Staff Finance')
            );
    }

    public function test_create_page_parses_existing_indonesian_signature_date(): void
    {
        $user = User::factory()->superadmin()->create();
        $company = SalaryCompany::query()->create([
            'name' => 'PT. Marko Jaya',
            'direktur' => 'Marko Simic',
            'is_active' => true,
        ]);
        $employee = SalaryEmployee::query()->create([
            'salary_company_id' => $company->id,
            'name' => 'Budi Santoso',
            'nik' => '1234567890',
            'jabatan' => 'Staff Finance',
            'is_active' => true,
        ]);

        SlipGaji::query()->create([
            'user_id' => $user->id,
            'salary_company_id' => $company->id,
            'salary_employee_id' => $employee->id,
            'employee_name' => $employee->name,
            'employee_nik' => $employee->nik,
            'employee_position' => $employee->jabatan,
            'status' => 'Staff Finance',
            'periode' => '1 - 25 Mei 2026',
            'period_month' => '2026-05',
            'tanggal_tf_cash' => '2026-05-26',
            'metode_pembayaran' => 'TF',
            'gaji_pokok' => 0,
            'uang_makan' => 0,
            'uang_lembur' => 0,
            'bpjs_kesehatan' => 0,
            'bpjs_ketenagakerjaan' => 0,
            'pph21' => 0,
            'total_pendapatan' => 5000000,
            'total_potongan' => 500000,
            'pendapatan_bersih' => 4500000,
            'tempat_tanggal_ttd' => 'Brebes, 26 Mei 2026',
            'penerima' => $employee->name,
            'direktur' => 'Marko Simic',
            'created_by' => $user->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/slip-gaji/create?employee='.$employee->uuid.'&month=2026-05');

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Kas/SlipGaji/Create')
                ->where('initialForm.tanggal_ttd', '2026-05-26')
            );
    }

    public function test_slip_gaji_pdf_prefers_company_director_name(): void
    {
        $user = User::factory()->superadmin()->create([
            'name' => 'Tester PDF',
        ]);
        $company = SalaryCompany::query()->create([
            'name' => 'PT. Marko Jaya',
            'direktur' => 'Marko Simic',
            'is_active' => true,
        ]);
        $employee = SalaryEmployee::query()->create([
            'salary_company_id' => $company->id,
            'name' => 'Budi Santoso',
            'nik' => '1234567890',
            'jabatan' => 'Staff Finance',
            'is_active' => true,
        ]);
        $slipGaji = SlipGaji::query()->create([
            'user_id' => $user->id,
            'salary_company_id' => $company->id,
            'salary_employee_id' => $employee->id,
            'employee_name' => $employee->name,
            'employee_nik' => $employee->nik,
            'employee_position' => $employee->jabatan,
            'status' => 'Karyawan Tetap',
            'periode' => '1 - 25 April 2026',
            'period_month' => '2026-04',
            'tanggal_tf_cash' => '2026-04-26',
            'metode_pembayaran' => 'TF',
            'gaji_pokok' => 0,
            'uang_makan' => 0,
            'uang_lembur' => 0,
            'bpjs_kesehatan' => 0,
            'bpjs_ketenagakerjaan' => 0,
            'pph21' => 0,
            'total_pendapatan' => 5000000,
            'total_potongan' => 500000,
            'pendapatan_bersih' => 4500000,
            'tempat_tanggal_ttd' => 'Brebes, 26 April 2026',
            'penerima' => $employee->name,
            'direktur' => 'Direktur Lama',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $html = view('pdf.kas.slip-gaji-pdf', [
            'slipGaji' => $slipGaji->load(['company', 'items']),
        ])->render();

        $this->assertStringContainsString('MARKO SIMIC', $html);
        $this->assertStringNotContainsString('DIREKTUR LAMA', $html);
    }
}
