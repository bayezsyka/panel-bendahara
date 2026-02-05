<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class OfficeContextService
{
    /**
     * Get the current office ID based on user role and session view.
     */
    public function getCurrentOfficeId(): int
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return 1; // Default fallback
        }

        if ($user->isSuperAdmin()) {
            return Session::get('current_office_view', 1);
        }

        return (int) $user->office_id;
    }

    /**
     * Get the name of an office by ID.
     */
    public function getOfficeName(?int $officeId = null): string
    {
        $id = $officeId ?? $this->getCurrentOfficeId();

        return match ($id) {
            1 => 'Kantor Utama',
            2 => 'Kantor Plant',
            default => 'Kantor Tidak Diketahui',
        };
    }
}
