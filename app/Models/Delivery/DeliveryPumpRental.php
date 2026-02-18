<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DeliveryPumpRental extends Model
{
    use LogsActivity;

    protected $guarded = ['id'];

    protected $casts = [
        'date' => 'date',
        'is_billed' => 'boolean',
        'rental_price' => 'decimal:2',
        'volume_pumped' => 'decimal:2',
        'limit_volume' => 'decimal:2',
        'over_volume_price' => 'decimal:2',
        'pipes_used' => 'integer',
        'limit_pipe' => 'integer',
        'over_pipe_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Sewa Pompa ini telah di-{$eventName}");
    }

    public function deliveryProject(): BelongsTo
    {
        return $this->belongsTo(DeliveryProject::class);
    }

    /**
     * Calculate the total price based on usage and limits.
     * This can be used to verify or re-calculate.
     */
    public function calculateTotal(): float
    {
        $overVolume = max(0, $this->volume_pumped - $this->limit_volume);
        $overPipe = max(0, $this->pipes_used - $this->limit_pipe);

        $overVolumeCost = $overVolume * $this->over_volume_price;
        $overPipeCost = $overPipe * $this->over_pipe_price;

        return $this->rental_price + $overVolumeCost + $overPipeCost;
    }
}
