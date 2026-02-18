<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\ReceivableTransaction;
use Spatie\Activitylog\Traits\LogsActivity;

class DeliveryProject extends Model
{
    use LogsActivity;

    protected $guarded = ['id'];

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Proyek Delivery ini telah di-{$eventName}");
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($project) {
            if ($project->isDirty('name') || empty($project->slug)) {
                $slug = \Illuminate\Support\Str::slug($project->name);
                $originalSlug = $slug;
                $count = 1;

                while (static::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                    $slug = $originalSlug . '-' . $count++;
                }

                $project->slug = $slug;
            }
        });
    }

    protected $casts = [
        'has_ppn' => 'boolean',
    ];

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
     * Get the pump rentals for the project.
     */
    public function pumpRentals(): HasMany
    {
        return $this->hasMany(DeliveryPumpRental::class);
    }

    /**
     * Get the default concrete grade for the project.
     */
    public function defaultConcreteGrade(): BelongsTo
    {
        return $this->belongsTo(ConcreteGrade::class, 'default_concrete_grade_id');
    }

    // Pembayaran (Kredit): Dari transaksi piutang (DP, Termin, Pelunasan)
    public function payments()
    {
        return $this->hasMany(ReceivableTransaction::class)->where('type', 'payment');
    }

    // Hitung Sisa Tagihan per Proyek
    public function getRemainingBalanceAttribute()
    {
        $totalTagihanShipment = $this->shipments->sum('total_price_with_tax');

        $pumpRentalsTotal = $this->pumpRentals->sum('total_price');
        $pumpRentalsTax = $this->has_ppn ? ($pumpRentalsTotal * 0.11) : 0;
        $totalTagihanPump = $pumpRentalsTotal + $pumpRentalsTax;

        $totalBayar = $this->payments->sum('amount');

        return ($totalTagihanShipment + $totalTagihanPump) - $totalBayar;
    }
}
