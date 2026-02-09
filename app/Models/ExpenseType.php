<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;

class ExpenseType extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'office_id',
        'category',
        'name',
        'code',
    ];

    protected $casts = [
        'office_id' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        // static::addGlobalScope(new \App\Models\Scopes\OfficeScope);

        static::creating(function ($model) {
            if (!$model->office_id) {
                $model->office_id = app(\App\Services\OfficeContextService::class)->getCurrentOfficeId();
            }
        });
    }

    public function expenses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Expense::class, 'expense_type_id');
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Tipe Biaya ini telah di-{$eventName}");
    }
}
