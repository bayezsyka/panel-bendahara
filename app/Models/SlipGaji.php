<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SlipGaji extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_name',
        'employee_nik',
        'employee_position',
        'status',
        'periode',
        'tanggal_tf_cash',
        'gaji_pokok',
        'uang_makan',
        'uang_lembur',
        'bpjs_kesehatan',
        'bpjs_ketenagakerjaan',
        'pph21',
        'pendapatan_bersih',
        'tempat_tanggal_ttd',
        'penerima',
        'direktur',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_tf_cash' => 'date:Y-m-d',
            'gaji_pokok' => 'decimal:2',
            'uang_makan' => 'decimal:2',
            'uang_lembur' => 'decimal:2',
            'bpjs_kesehatan' => 'decimal:2',
            'bpjs_ketenagakerjaan' => 'decimal:2',
            'pph21' => 'decimal:2',
            'pendapatan_bersih' => 'decimal:2',
        ];
    }

    public function pegawai()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
