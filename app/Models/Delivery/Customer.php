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

    public function projects()
    {
        // Relasi ke DeliveryProject (Proyek Pengiriman)
        return $this->hasMany(DeliveryProject::class);
    }

    // Accessor untuk Total Piutang Akumulatif
    public function getTotalReceivableAttribute()
    {
        return $this->projects->sum(function ($project) {
            return $project->remaining_balance;
        });
    }
}
