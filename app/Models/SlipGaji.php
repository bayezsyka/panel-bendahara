<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SlipGaji extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'salary_company_id',
        'salary_employee_id',
        'employee_name',
        'employee_nik',
        'employee_position',
        'status',
        'periode',
        'period_month',
        'is_finalized',
        'tanggal_tf_cash',
        'metode_pembayaran',
        'gaji_pokok',
        'uang_makan',
        'uang_lembur',
        'bpjs_kesehatan',
        'bpjs_ketenagakerjaan',
        'pph21',
        'total_pendapatan',
        'total_potongan',
        'pendapatan_bersih',
        'tempat_tanggal_ttd',
        'penerima',
        'direktur',
        'created_by',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'tanggal_tf_cash' => 'date:Y-m-d',
            'is_finalized' => 'boolean',
            'gaji_pokok' => 'decimal:2',
            'uang_makan' => 'decimal:2',
            'uang_lembur' => 'decimal:2',
            'bpjs_kesehatan' => 'decimal:2',
            'bpjs_ketenagakerjaan' => 'decimal:2',
            'pph21' => 'decimal:2',
            'total_pendapatan' => 'decimal:2',
            'total_potongan' => 'decimal:2',
            'pendapatan_bersih' => 'decimal:2',
        ];
    }

    public function company()
    {
        return $this->belongsTo(SalaryCompany::class, 'salary_company_id');
    }

    public function employee()
    {
        return $this->belongsTo(SalaryEmployee::class, 'salary_employee_id');
    }

    public function pegawai()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(SlipGajiItem::class)->orderBy('component_type')->orderBy('sort_order')->orderBy('id');
    }
}
