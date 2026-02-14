<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceivableTransaction extends Model
{
    use HasFactory, \Spatie\Activitylog\Traits\LogsActivity;

    protected $guarded = ['id'];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Transaksi Piutang ini telah di-{$eventName}");
    }

    public function customer()
    {
        return $this->belongsTo(Delivery\Customer::class);
    }

    public function deliveryProject()
    {
        return $this->belongsTo(Delivery\DeliveryProject::class);
    }
}
