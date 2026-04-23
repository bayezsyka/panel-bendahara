<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSlipGajiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canCreate('slip_gaji') ?? false;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'string', 'exists:salary_employees,uuid'],
            'period_month' => ['required', 'regex:/^\d{4}\-\d{2}$/'],
            'tanggal_tf_cash' => ['required', 'date'],
            'income_items' => ['required', 'array', 'min:1'],
            'income_items.*.salary_component_type_id' => ['required', 'integer', 'exists:salary_component_types,id'],
            'income_items.*.amount' => ['nullable', 'numeric', 'min:0'],
            'deduction_items' => ['required', 'array'],
            'deduction_items.*.salary_component_type_id' => ['required', 'integer', 'exists:salary_component_types,id'],
            'deduction_items.*.amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:255'],
            'metode_pembayaran' => ['required', 'string', 'in:TF,CASH'],
            'tanggal_ttd' => ['required', 'date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $incomeItems = collect($this->input('income_items', []))
            ->map(fn ($item) => [
                'salary_component_type_id' => $item['salary_component_type_id'] ?? null,
                'amount' => ($item['amount'] ?? null) === '' ? 0 : ($item['amount'] ?? 0),
            ])
            ->values()
            ->all();

        $deductionItems = collect($this->input('deduction_items', []))
            ->map(fn ($item) => [
                'salary_component_type_id' => $item['salary_component_type_id'] ?? null,
                'amount' => ($item['amount'] ?? null) === '' ? 0 : ($item['amount'] ?? 0),
            ])
            ->values()
            ->all();

        $this->merge([
            'income_items' => $incomeItems,
            'deduction_items' => $deductionItems,
        ]);
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'Pegawai wajib dipilih.',
            'employee_id.exists' => 'Pegawai yang dipilih tidak ditemukan.',
            'period_month.required' => 'Periode bulan wajib dipilih.',
            'tanggal_tf_cash.required' => 'Tanggal TF/Cash wajib diisi.',
            'tanggal_ttd.required' => 'Tanggal TTD wajib diisi.',
            'income_items.required' => 'Minimal harus ada satu komponen pendapatan.',
        ];
    }
}
