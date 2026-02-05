<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceivableTransaction extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'date' => 'date',
        'bill_amount' => 'decimal:2',
        'payment_amount' => 'decimal:2',
        'volume' => 'decimal:2',
        'price_per_m3' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeForCurrentOffice($query)
    {
        return $query->where('office_id', 1);
    }
}
