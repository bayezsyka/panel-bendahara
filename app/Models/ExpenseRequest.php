<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;

class ExpenseRequest extends Model
{
    use LogsActivity;

    protected $fillable = [
        'mandor_id',
        'project_id',
        'source',
        'input_type',
        'title',
        'description',
        'amount',
        'transacted_at',
        'receipt_image',
        'items',
        'status',
        'expense_id',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'review_note',
    ];

    protected $casts = [
        'items' => 'array',
        'transacted_at' => 'date',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function mandor(): BelongsTo
    {
        return $this->belongsTo(Mandor::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Permintaan biaya ini telah di-{$eventName}");
    }
}
