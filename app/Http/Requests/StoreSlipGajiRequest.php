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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'status' => ['required', 'string', 'max:100'],
            'periode' => ['required', 'string', 'max:100'],
            'tanggal_tf_cash' => ['required', 'date'],
            'gaji_pokok' => ['required', 'numeric', 'min:0'],
            'uang_makan' => ['nullable', 'numeric', 'min:0'],
            'uang_lembur' => ['nullable', 'numeric', 'min:0'],
            'bpjs_kesehatan' => ['nullable', 'numeric', 'min:0'],
            'bpjs_ketenagakerjaan' => ['nullable', 'numeric', 'min:0'],
            'pph21' => ['nullable', 'numeric', 'min:0'],
            'tempat_tanggal_ttd' => ['required', 'string', 'max:150'],
            'direktur' => ['required', 'string', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $numericFields = [
            'gaji_pokok',
            'uang_makan',
            'uang_lembur',
            'bpjs_kesehatan',
            'bpjs_ketenagakerjaan',
            'pph21',
        ];

        $prepared = [];

        foreach ($numericFields as $field) {
            $value = $this->input($field);
            $prepared[$field] = $value === null || $value === '' ? 0 : $value;
        }

        $this->merge($prepared);
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Pegawai wajib dipilih.',
            'user_id.exists' => 'Pegawai yang dipilih tidak ditemukan.',
            'gaji_pokok.required' => 'Gaji pokok wajib diisi.',
            'tanggal_tf_cash.required' => 'Tanggal TF/Cash wajib diisi.',
            'tempat_tanggal_ttd.required' => 'Tempat dan tanggal TTD wajib diisi.',
        ];
    }
}
