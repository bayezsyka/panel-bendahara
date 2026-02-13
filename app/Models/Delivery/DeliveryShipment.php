<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryShipment extends Model
{
    protected $guarded = ['id'];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'date' => 'date',
        'is_billed' => 'boolean',
        'volume' => 'decimal:2',
        'price_per_m3' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saving(function (DeliveryShipment $shipment) {
            $shipment->total_price = $shipment->volume * $shipment->price_per_m3;

            // Ensure project is loaded
            if (!$shipment->relationLoaded('project')) {
                $shipment->load('project');
            }

            $shipment->total_price_with_tax = $shipment->project->has_ppn
                ? ($shipment->total_price * 1.11)
                : $shipment->total_price;
        });
    }

    /**
     * Get the project that owns the shipment.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(DeliveryProject::class, 'delivery_project_id');
    }

    /**
     * Alias for project() relationship for backward compatibility.
     */
    public function deliveryProject(): BelongsTo
    {
        return $this->project();
    }

    /**
     * Get the concrete grade for the shipment.
     */
    public function concreteGrade(): BelongsTo
    {
        return $this->belongsTo(ConcreteGrade::class);
    }
}
