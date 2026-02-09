<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceivableTransaction extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function customer()
    {
        return $this->belongsTo(Delivery\Customer::class);
    }

    public function deliveryProject()
    {
        return $this->belongsTo(Delivery\DeliveryProject::class);
    }
}
