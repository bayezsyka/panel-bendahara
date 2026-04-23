<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryCompany extends Model
{
    protected $fillable = [
        'name',
        'direktur',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function employees()
    {
        return $this->hasMany(SalaryEmployee::class, 'salary_company_id')
            ->orderBy('name');
    }

    public function slipGajis()
    {
        return $this->hasMany(SlipGaji::class);
    }
}
