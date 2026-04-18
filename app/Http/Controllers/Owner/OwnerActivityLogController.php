<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Support\ActivityLogTimestamp;
use Carbon\CarbonImmutable;
use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OwnerActivityLogController extends Controller
{
    private const PER_PAGE_OPTIONS = [20, 50, 100, 200];

    /**
     * Reuse the same label maps from the Superadmin version — single source of truth.
     */
    private const SUBJECT_LABELS = [
        'App\Models\User'                       => 'User',
        'App\Models\Project'                    => 'Proyek',
        'App\Models\Expense'                    => 'Pengeluaran',
        'App\Models\ExpenseItem'                => 'Item Pengeluaran',
        'App\Models\ExpenseType'                => 'Tipe Biaya',
        'App\Models\Mandor'                     => 'Mandor',
        'App\Models\Bendera'                    => 'Bendera',
        'App\Models\PlantTransaction'           => 'Transaksi Kas',
        'App\Models\CashSource'                 => 'Sumber Kas',
        'App\Models\CashExpenseType'            => 'Tipe Biaya Kas',
        'App\Models\ReceivableTransaction'      => 'Transaksi Piutang',
        'App\Models\Delivery\DeliveryProject'   => 'Proyek Delivery',
        'App\Models\Delivery\DeliveryShipment'  => 'Pengiriman',
        'App\Models\Delivery\DeliveryPumpRental'=> 'Sewa Pompa',
        'App\Models\Delivery\Customer'          => 'Customer',
        'App\Models\Delivery\ConcreteGrade'     => 'Mutu Beton',
    ];

    private const EVENT_LABELS = [
        'created'  => 'Dibuat',
        'updated'  => 'Diperbarui',
        'deleted'  => 'Dihapus',
        'restored' => 'Dipulihkan',
    ];

    private const EVENT_SEVERITY = [
        'created'  => 'success',
        'updated'  => 'warning',
        'deleted'  => 'danger',
        'restored' => 'info',
    ];

    /**
     * Read-Only Activity Log for Owner Dashboard.
     * Supports filtering by event, module, causer, and date range.
     */
    public function index(Request $request)
    {
        $perPage = in_array((int) $request->integer('per_page', 20), self::PER_PAGE_OPTIONS, true)
            ? (int) $request->integer('per_page', 20)
            : 20;

        $query = Activity::with(['causer'])->latest();

        // Filter: Pencarian teks (description atau nama user)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('causer', fn($sub) => $sub->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter: Jenis event
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Filter: Modul (subject_type)
        if ($request->filled('module')) {
            $query->where('subject_type', $request->module);
        }

        // Filter: Tanggal dari – sampai
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', CarbonImmutable::parse($request->date_from, ActivityLogTimestamp::timezone())->startOfDay());
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', CarbonImmutable::parse($request->date_to, ActivityLogTimestamp::timezone())->endOfDay());
        }

        $logs = $query->paginate($perPage)->withQueryString()->through(function ($log) {
            return [
                'id'           => $log->id,
                'description'  => $log->description,
                'subject_type' => self::SUBJECT_LABELS[$log->subject_type] ?? class_basename((string) $log->subject_type),
                'event'        => $log->event,
                'event_label'  => self::EVENT_LABELS[$log->event] ?? ucfirst((string) $log->event),
                'event_severity' => self::EVENT_SEVERITY[$log->event] ?? 'neutral',
                'causer'       => $log->causer?->name ?? 'Sistem',
                'causer_role'  => $log->causer?->role ?? null,
                'ip_address'   => $log->properties['ip'] ?? ($log->properties['attributes']['ip'] ?? 'N/A'),
                'created_at'   => ActivityLogTimestamp::make($log->created_at),
            ];
        });

        // Dropdown filter: Modul unik
        $modules = Activity::select('subject_type')
            ->distinct()
            ->whereNotNull('subject_type')
            ->pluck('subject_type')
            ->map(fn($type) => [
                'value' => $type,
                'label' => self::SUBJECT_LABELS[$type] ?? class_basename($type),
            ])
            ->sortBy('label')
            ->values();

        // Dropdown filter: Event unik
        $events = Activity::select('event')
            ->distinct()
            ->whereNotNull('event')
            ->pluck('event')
            ->map(fn($evt) => [
                'value' => $evt,
                'label' => self::EVENT_LABELS[$evt] ?? ucfirst($evt),
            ])
            ->values();

        return Inertia::render('Owner/ActivityLog', [
            'logs'    => $logs,
            'filters' => $request->only(['search', 'event', 'module', 'date_from', 'date_to', 'per_page']),
            'filterOptions' => [
                'modules' => $modules,
                'events'  => $events,
                'perPageOptions' => self::PER_PAGE_OPTIONS,
            ],
        ]);
    }
}
