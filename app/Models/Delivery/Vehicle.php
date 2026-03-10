<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $table = 'delivery_trucks';

    protected $fillable = [
        'vehicle_number',
        'driver_name',
        'is_active',
        'office_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope a query to only include active vehicles.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
