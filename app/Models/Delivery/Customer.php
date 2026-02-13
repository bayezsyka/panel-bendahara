<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $guarded = ['id'];

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($customer) {
            if ($customer->isDirty('name') || empty($customer->slug)) {
                $slug = \Illuminate\Support\Str::slug($customer->name);
                $originalSlug = $slug;
                $count = 1;

                while (static::where('slug', $slug)->where('id', '!=', $customer->id)->exists()) {
                    $slug = $originalSlug . '-' . $count++;
                }

                $customer->slug = $slug;
            }
        });
    }

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
