<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashSource extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    protected $fillable = ['name', 'description'];

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Sumber Dana ini telah di-{$eventName}");
    }
}
