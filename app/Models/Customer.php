<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function receivableTransactions()
    {
        return $this->hasMany(ReceivableTransaction::class);
    }

    public function scopeForCurrentOffice($query)
    {
        return $query->where('office_id', 1);
    }

    public function getBalanceAttribute()
    {
        // Menggunakan collection sum agar bisa memanfaatkan eager loading (with)
        return $this->receivableTransactions->sum('bill_amount') - $this->receivableTransactions->sum('payment_amount');
    }
}
