<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mandor extends Model
{
    protected $fillable = [
        'name',
        'whatsapp_number',
    ];

    /**
     * Mandor bisa memegang banyak proyek (History)
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Helper untuk mendapatkan proyek yang sedang aktif dikerjakan mandor ini
     */
    public function activeProject()
    {
        return $this->hasOne(Project::class)->where('status', 'ongoing')->latestOfMany();
    }
}
