<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Tambahkan ini
use Illuminate\Support\Carbon;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'status',
        'coordinates',
        'mandor_id', // <-- TAMBAHKAN INI
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    // --- RELASI BARU KE MANDOR ---
    public function mandor(): BelongsTo
    {
        return $this->belongsTo(Mandor::class);
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
}
