<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'type',
        'amount',
        'description',
        'transacted_at',
        'created_by',
    ];

    protected $casts = [
        'transacted_at' => 'date'
    ];
}
