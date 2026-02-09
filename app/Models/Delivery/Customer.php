<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $guarded = ['id'];

    /**
     * Get the delivery projects for the customer.
     */
    public function deliveryProjects(): HasMany
    {
        return $this->hasMany(DeliveryProject::class);
    }
}
