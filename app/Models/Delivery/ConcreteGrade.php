<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConcreteGrade extends Model
{
    protected $guarded = ['id'];

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
