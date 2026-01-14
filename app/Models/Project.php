<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'status',
        'coordinates',
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }
}
