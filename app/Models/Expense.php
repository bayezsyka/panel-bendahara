<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;

class Expense extends Model
{
    use LogsActivity;

    protected $fillable = [
        'project_id',
        'expense_type_id', // Tambahan tipe biaya
        'title',
        'description',
        'amount',
        'receipt_image',
        'status',
        'transacted_at',
        'office_id',
    ];

    protected static function boot()
    {
        parent::boot();
        static::addGlobalScope(new \App\Models\Scopes\OfficeScope);
    }
    protected $casts = [
        'transacted_at' => 'date',
        'amount' => 'decimal:2',
        'office_id' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ExpenseItem::class);
    }

    public function expenseType(): BelongsTo
    {
        return $this->belongsTo(ExpenseType::class, 'expense_type_id');
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Pengeluaran ini telah di-{$eventName}");
    }

    public function tapActivity(\Spatie\Activitylog\Contracts\Activity $activity, string $eventName)
    {
        $activity->properties = $activity->properties->merge([
            'context' => [
                'title' => $this->title,
                'transacted_at' => $this->transacted_at ? $this->transacted_at->format('d M Y') : '-',
                'amount' => 'Rp ' . number_format($this->amount, 0, ',', '.'),
                'expense_type' => $this->expenseType ? $this->expenseType->name : '-',
                'project' => $this->project ? $this->project->name : '-',
            ]
        ]);
    }
}
