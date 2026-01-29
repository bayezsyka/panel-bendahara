<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Spatie\Activitylog\Traits\LogsActivity;

class Project extends Model
{
    use LogsActivity;
    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
        'coordinates',
        'mandor_id',
        'bendera_id',
        'location',
    ];

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($project) {
            if ($project->isDirty('name') || empty($project->slug)) {
                $slug = Str::slug($project->name);
                $originalSlug = $slug;
                $count = 1;

                // Ensure uniqueness (except for self)
                while (static::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                    $slug = $originalSlug . '-' . $count++;
                }

                $project->slug = $slug;
            }
        });
    }

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Relasi many-to-many dengan Mandor
     * Satu project bisa dipegang oleh banyak mandor
     */
    public function mandors(): BelongsToMany
    {
        return $this->belongsToMany(Mandor::class)->withTimestamps();
    }

    /**
     * Helper untuk mendapatkan mandor pertama (backward compatibility)
     * Atau bisa digunakan untuk mendapatkan mandor utama
     */
    public function mandor(): BelongsTo
    {
        return $this->belongsTo(Mandor::class);
    }

    public function bendera(): BelongsTo
    {
        return $this->belongsTo(Bendera::class);
    }

    // ... (kode accessor getStartDateAttribute dll biarkan tetap ada) ...
    public function getStartDateAttribute()
    {
        return $this->created_at;
    }

    public function getEndDateAttribute()
    {
        return $this->status === 'completed' ? $this->updated_at : now();
    }

    public function getDurationTextAttribute()
    {
        $diff = $this->start_date->diff($this->end_date);

        $parts = [];
        if ($diff->y > 0) $parts[] = $diff->y . ' tahun';
        if ($diff->m > 0) $parts[] = $diff->m . ' bulan';
        if ($diff->d > 0) $parts[] = $diff->d . ' hari';

        return count($parts) > 0 ? implode(' ', $parts) : 'Baru saja';
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Proyek ini telah di-{$eventName}");
    }
}
