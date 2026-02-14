<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;

class ConcreteGrade extends Model
{
    use LogsActivity;

    protected $guarded = ['id'];

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Mutu Beton ini telah di-{$eventName}");
    }

    /**
     * Get the shipments for the concrete grade.
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(DeliveryShipment::class, 'concrete_grade_id');
    }

    /**
     * Get the projects where this is the default grade.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(DeliveryProject::class, 'default_concrete_grade_id');
    }
}
