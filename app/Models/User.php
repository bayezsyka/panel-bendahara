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
        'allowed_panels',
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
            'allowed_panels' => 'array',
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
    const PANEL_DELIVERY = 'delivery'; // Pengiriman (Surat Jalan)

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

    /**
     * Check if user is restricted to input only (Create/Store).
     * Rule: "Bendahara kantor plant ... dia hanya bisa menginput data saja".
     */
    public function isRestrictedToInputOnly(): bool
    {
        return $this->isBendahara() && $this->isKantorPlant();
    }

    // Unified Access Logic
    public function canAccessPanel(string $panel): bool
    {
        // 1. Kantor Utama: Superadmin & Bendahara can open ALL panels.
        if ($this->isKantorUtama()) {
            return true;
        }

        // 2. Kantor Plant: Access restricted to allowed_panels.
        // Also checks legacy mapping if needed.

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
            $this->canAccessPanel(self::PANEL_RECEIVABLE) ||
            $this->canAccessPanel(self::PANEL_DELIVERY);
    }

    public function getHomeRoute(): string
    {
        // Priority order for redirect
        if ($this->canAccessPanel(self::PANEL_FINANCE)) return 'projectexpense.overview';
        if ($this->canAccessPanel(self::PANEL_RECEIVABLE)) return 'receivable.index';
        if ($this->canAccessPanel(self::PANEL_CASH)) return 'kas.dashboard';
        if ($this->canAccessPanel(self::PANEL_DELIVERY)) return 'delivery.projects.index';

        return 'no.access';
    }

    /**
     * Check if user is Superadmin Utama (Full Admin Access: Users, Logs, etc.)
     */
    public function isSuperAdminUtama(): bool
    {
        return $this->isSuperAdmin() && $this->isKantorUtama();
    }

    /**
     * Check if user can fully manage (Create, Update, Delete) data in a specific context.
     * Context typically matches panel names or specific permissions.
     */
    public function canManage(string $context): bool
    {
        // Must have basic access first
        if (!$this->canAccessPanel($context)) {
            return false;
        }

        // If restricted to input only (Bendahara Plant), they cannot manage (edit/delete)
        if ($this->isRestrictedToInputOnly()) {
            return false;
        }

        // Everyone else with access (Superadmin Utama, Bendahara Utama, Superadmin Plant) can manage
        return true;
    }

    /**
     * Check if user can create data in a specific context.
     */
    public function canCreate(string $context): bool
    {
        // Must have basic access
        if (!$this->canAccessPanel($context)) {
            return false;
        }

        // Even "Input Only" users can create
        return true;
    }

    // Legacy Access Helpers (can be removed later if unused)
    public function hasAccessToFinance()
    {
        return $this->canAccessPanel(self::PANEL_FINANCE);
    }
    public function hasAccessToReceivable()
    {
        return $this->canAccessPanel(self::PANEL_RECEIVABLE);
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
