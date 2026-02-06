<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantTransaction extends Model
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    protected $fillable = [
        'transaction_date',
        'type', // 'in', 'out'
        'cash_type', // 'kas_besar', 'kas_kecil'
        'amount',
        'description',
        'expense_type_id',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function expenseType()
    {
        return $this->belongsTo(ExpenseType::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Transaksi Plant ini telah di-{$eventName}");
    }
}
