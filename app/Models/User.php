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
    const PANEL_PLANT_CASH = 'plant_cash'; // Kas Besar/Kecil
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
        // Superadmin Utama can access everything
        if ($this->isSuperAdmin() && $this->isKantorUtama()) {
            return true;
        }

        // Superadmin Plant can view everything (read-only access check handled separately, but they can 'open' the panel)
        if ($this->isSuperAdmin() && $this->isKantorPlant()) {
            return true;
        }

        // Bendahara restricted to assigned panels
        return in_array($panel, $this->allowed_panels ?? []);
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
            // Full CRUD on assigned panels (Finance, Receivable)
            // But they must have the panel assigned
            if (!$this->canAccessPanel($context)) return false;

            // "misal panel piutang, di panel itu dia bisa crud lengkap"
            // Assuming same for Finance
            if ($context === self::PANEL_FINANCE || $context === self::PANEL_RECEIVABLE) {
                return true;
            }
            // Cannot manage Plant Cash usually? User didn't specify. Assuming Office boundaries.
            if ($context === self::PANEL_PLANT_CASH) {
                return false;
            }
        }

        // 4. Bendahara Plant
        if ($this->isBendahara() && $this->isKantorPlant()) {
            return $this->checkBendaharaPlantWriteAccess($context);
        }

        return false;
    }

    private function checkBendaharaPlantWriteAccess(string $context): bool
    {
        if (!$this->canAccessPanel($context) && !$this->isSuperAdmin()) return false; // Superadmin bypass access check for view, but for write? 
        // If Superadmin Plant is editing, he effectively has permissions of Bendahara Plant.

        if ($context === self::PANEL_PLANT_CASH) {
            return true; // "Kantor Plant" manages "Plant Cash"
        }

        if ($context === self::PANEL_RECEIVABLE) {
            // "dia cuma bisa nambahin data aja, gabisa crud selain create"
            // This method checks generic "Manage" (Edit/Delete).
            // So return FALSE for general update/delete. 
            // We need a separate canCreate()
            return false;
        }

        if ($context === self::PANEL_FINANCE) {
            return false; // Plant shouldn't manage Utama finance
        }

        return false;
    }

    public function canCreate(string $context): bool
    {
        if ($this->canManage($context)) return true;

        // Special case: Bendahara/Superadmin Plant in Receivable
        // "dia cuma bisa nambahin data aja"
        if ($this->isKantorPlant() && $context === self::PANEL_RECEIVABLE) {
            // Must have access (Superadmin has access implies yes)
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

    /**
     * Get the default route name for this user after login.
     */
    public function getHomeRoute(): string
    {
        // Prioritize Finance Panel
        if ($this->canAccessPanel(self::PANEL_FINANCE)) return 'projectexpense.overview';

        // Then Receivable
        if ($this->canAccessPanel(self::PANEL_RECEIVABLE)) return 'receivable.dashboard';

        // Then Plant Cash
        if ($this->canAccessPanel(self::PANEL_PLANT_CASH)) return 'bendahara.plant.kas-besar';

        // Lastly, if no specific panel access, return No Access page
        return 'no.access';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'role', 'is_active', 'office_id', 'allowed_panels']) // Kolom apa yang dipantau
            ->logOnlyDirty() // Hanya catat yang berubah
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "User ini telah di-{$eventName}");
    }
}
