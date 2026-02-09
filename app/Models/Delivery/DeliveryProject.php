<?php

namespace App\Models\Delivery;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\ReceivableTransaction;

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

    // Pembayaran (Kredit): Dari transaksi piutang (DP, Termin, Pelunasan)
    public function payments()
    {
        return $this->hasMany(ReceivableTransaction::class)->where('type', 'payment');
    }

    // Hitung Sisa Tagihan per Proyek
    public function getRemainingBalanceAttribute()
    {
        $totalTagihan = $this->shipments->sum('total_price_with_tax'); // Asumsi ada field kalkulasi
        $totalBayar = $this->payments->sum('amount');

        return $totalTagihan - $totalBayar;
    }
}
