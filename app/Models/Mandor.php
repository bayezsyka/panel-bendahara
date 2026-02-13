<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\Traits\LogsActivity;

class Mandor extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'office_id',
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

    /**
     * Relasi many-to-many dengan Project
     * Satu mandor bisa memegang banyak proyek
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class)->withTimestamps();
    }

    /**
     * Helper untuk mendapatkan proyek yang sedang aktif dikerjakan mandor ini
     */
    public function activeProjects()
    {
        return $this->belongsToMany(Project::class)
            ->wherePivotIn('project_id', function ($query) {
                $query->select('id')
                    ->from('projects')
                    ->where('status', 'ongoing');
            })
            ->withTimestamps();
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Mandor ini telah di-{$eventName}");
    }
}
