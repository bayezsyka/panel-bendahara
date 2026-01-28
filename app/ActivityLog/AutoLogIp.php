<?php

namespace App\ActivityLog;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Contracts\LoggablePipe;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Request;

class AutoLogIp implements LoggablePipe
{
    public function __invoke(Model $model, LogOptions $logOptions)
    {
        $logOptions->setDescriptionForEvent(fn(string $eventName) => "Data has been {$eventName}");

        // Simpan IP ke properti custom di log
        activity()->withProperties(['ip' => Request::ip()]);

        return $logOptions;
    }
}
