<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;

class Customer extends Model
{
    use LogsActivity;

    protected $guarded = ['id'];

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Customer ini telah di-{$eventName}");
    }

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
