<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryComponentType extends Model
{
    public const TYPE_INCOME = 'income';

    public const TYPE_DEDUCTION = 'deduction';

    protected $fillable = [
        'name',
        'type',
        'description',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function slipItems()
    {
        return $this->hasMany(SlipGajiItem::class, 'salary_component_type_id');
    }
}
