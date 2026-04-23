<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlipGajiItem extends Model
{
    protected $fillable = [
        'slip_gaji_id',
        'salary_component_type_id',
        'component_name',
        'component_type',
        'amount',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    public function slipGaji()
    {
        return $this->belongsTo(SlipGaji::class);
    }

    public function componentType()
    {
        return $this->belongsTo(SalaryComponentType::class, 'salary_component_type_id');
    }
}
