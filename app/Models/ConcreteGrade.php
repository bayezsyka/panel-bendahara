<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConcreteGrade extends Model
{
    protected $guarded = ['id'];

    public function scopeForCurrentOffice($query)
    {
        return $query->where('office_id', 1);
    }
}
