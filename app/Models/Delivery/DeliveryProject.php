<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryProject extends Model
{
    protected $guarded = ['id'];

    /**
     * Get the customer that owns the project.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the shipments for the project.
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(DeliveryShipment::class);
    }

    /**
     * Get the default concrete grade for the project.
     */
    public function defaultConcreteGrade(): BelongsTo
    {
        return $this->belongsTo(ConcreteGrade::class, 'default_concrete_grade_id');
    }
}
