<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashExpenseType extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    protected $fillable = ['name', 'description'];

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Tipe Biaya Kas ini telah di-{$eventName}");
    }
}
