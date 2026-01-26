<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Mandor extends Model
{
    protected $fillable = [
        'name',
        'whatsapp_number',
    ];

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
}
