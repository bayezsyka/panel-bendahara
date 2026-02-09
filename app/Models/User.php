<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\Traits\LogsActivity; // Tambahkan ini
use Spatie\Activitylog\LogOptions; // Tambahkan ini

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'office_id',
        'allowed_panels', // Added
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'office_id' => 'integer',
            'allowed_panels' => 'array', // Added
        ];
    }

    // Constants
    const ROLE_SUPERADMIN = 'superadmin';
    const ROLE_BENDAHARA = 'bendahara';

    const OFFICE_UTAMA = 1;
    const OFFICE_PLANT = 2;

    const PANEL_FINANCE = 'finance'; // Biaya Proyek/Operasional
    const PANEL_CASH = 'kas'; // Kas Besar/Kecil
    const PANEL_RECEIVABLE = 'receivable'; // Piutang

    // Role Helpers
    public function isSuperAdmin()
    {
        return $this->role === self::ROLE_SUPERADMIN;
    }

    public function isBendahara()
    {
        return $this->role === self::ROLE_BENDAHARA;
    }

    public function isKantorUtama()
    {
        return $this->office_id === self::OFFICE_UTAMA;
    }

    public function isKantorPlant()
    {
        return $this->office_id === self::OFFICE_PLANT;
    }

    // Unified Access Logic
    public function canAccessPanel(string $panel): bool
    {
        // Superadmin access to everything
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Bendahara restricted to assigned panels
        // This decouples the panel access from the office ID as requested

        // Handle legacy constant mapping for migration safety
        $panelsToCheck = [$panel];
        // 'kas' might be stored as 'plant_cash' in legacy data
        if ($panel === self::PANEL_CASH) {
            $panelsToCheck[] = 'plant_cash';
        }

        foreach ($panelsToCheck as $p) {
            if (in_array($p, $this->allowed_panels ?? [])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user uses the layout with sidebar
     */
    public function hasPanelAccess(): bool
    {
        return $this->canAccessPanel(self::PANEL_FINANCE) ||
            $this->canAccessPanel(self::PANEL_CASH) ||
            $this->canAccessPanel(self::PANEL_RECEIVABLE);
    }

    public function getHomeRoute(): string
    {
        if ($this->canAccessPanel(self::PANEL_FINANCE)) return 'projectexpense.overview';
        if ($this->canAccessPanel(self::PANEL_RECEIVABLE)) return 'receivable.index';
        if ($this->canAccessPanel(self::PANEL_CASH)) return 'kas.dashboard';
        return 'no.access';
    }

    /**
     * Check if user can create/edit/delete data in a specific context.
     * Contexts: 'finance', 'plant_cash', 'receivable'
     */
    public function canManage(string $context): bool
    {
        // 1. Superadmin Utama: God mod
        if ($this->isSuperAdmin() && $this->isKantorUtama()) {
            return true;
        }

        // 2. Superadmin Plant
        if ($this->isSuperAdmin() && $this->isKantorPlant()) {
            // "Crud seperti bendahara-kantor plant"
            // Assuming this means they control Plant Cash, and maybe partial Piutang?
            // "misal panel piutang ... bendahara, kantor plant ... cuma bisa nambahin data aja"
            // So for Superadmin Plant, logic follows Bendahara Plant for Write operations.
            return $this->checkBendaharaPlantWriteAccess($context);
        }

        // 3. Bendahara Utama
        if ($this->isBendahara() && $this->isKantorUtama()) {
            if (!$this->canAccessPanel($context)) return false;

            if ($context === self::PANEL_FINANCE || $context === self::PANEL_RECEIVABLE) {
                return true;
            }
            if ($context === self::PANEL_CASH) {
                return true; // Utama can manage Cash if assigned
            }
        }

        // 4. Bendahara Plant / Generic Bendahara
        // Since we are decoupling from office, we should check access.
        // But for Receivable/Finance, the office rules might still apply?
        // "Hak akses piutang: kantor 1 crud, kantor 2 create only". 
        // So checking `isKantorPlant` is still valid for Receivable/Finance context.

        if ($this->isBendahara()) {
            // Fallback for generic Bendahara logic
            if ($context === self::PANEL_CASH && $this->canAccessPanel(self::PANEL_CASH)) {
                return true;
            }

            if ($this->isKantorPlant()) {
                return $this->checkBendaharaPlantWriteAccess($context);
            }
        }

        return false;
    }

    private function checkBendaharaPlantWriteAccess(string $context): bool
    {
        if (!$this->canAccessPanel($context) && !$this->isSuperAdmin()) return false;

        if ($context === self::PANEL_CASH) {
            return true;
        }

        if ($context === self::PANEL_RECEIVABLE) {
            // "dia cuma bisa nambahin data aja, gabisa crud selain create"
            return false;
        }

        if ($context === self::PANEL_FINANCE) {
            return false;
        }

        return false;
    }

    public function canCreate(string $context): bool
    {
        if ($this->canManage($context)) return true;

        if ($this->isKantorPlant() && $context === self::PANEL_RECEIVABLE) {
            if ($this->isBendahara() && !$this->canAccessPanel($context)) return false;
            return true;
        }

        return false;
    }

    // Access Methods (Legacy/Refactored)
    public function hasAccessToFinance()
    {
        return $this->canAccessPanel(self::PANEL_FINANCE);
    }

    public function hasAccessToReceivable()
    {
        return $this->canAccessPanel(self::PANEL_RECEIVABLE);
    }

    // Removed duplicate getHomeRoute()

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'role', 'is_active', 'office_id', 'allowed_panels']) // Kolom apa yang dipantau
            ->logOnlyDirty() // Hanya catat yang berubah
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "User ini telah di-{$eventName}");
    }
}
