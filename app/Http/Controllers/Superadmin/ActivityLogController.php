<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Support\ActivityLogTimestamp;
use Carbon\CarbonImmutable;
use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    private const PER_PAGE_OPTIONS = [25, 50, 100, 200];

    /**
     * Mapping subject_type ke label yang lebih mudah dibaca.
     */
    private const SUBJECT_LABELS = [
        'App\Models\User'                       => 'User',
        'App\Models\Project'                     => 'Proyek',
        'App\Models\Expense'                     => 'Pengeluaran',
        'App\Models\ExpenseItem'                 => 'Item Pengeluaran',
        'App\Models\ExpenseType'                 => 'Tipe Biaya',
        'App\Models\Mandor'                      => 'Mandor',
        'App\Models\Bendera'                     => 'Bendera',
        'App\Models\PlantTransaction'            => 'Transaksi Kas',
        'App\Models\CashSource'                  => 'Sumber Kas',
        'App\Models\CashExpenseType'             => 'Tipe Biaya Kas',
        'App\Models\ReceivableTransaction'       => 'Transaksi Piutang',
        'App\Models\Delivery\DeliveryProject'    => 'Proyek Delivery',
        'App\Models\Delivery\DeliveryShipment'   => 'Pengiriman',
        'App\Models\Delivery\DeliveryPumpRental' => 'Sewa Pompa',
        'App\Models\Delivery\Customer'           => 'Customer',
        'App\Models\Delivery\ConcreteGrade'      => 'Mutu Beton',
    ];

    /**
     * Event labels.
     */
    private const EVENT_LABELS = [
        'created'  => 'Dibuat',
        'updated'  => 'Diperbarui',
        'deleted'  => 'Dihapus',
        'restored' => 'Dipulihkan',
    ];

    public function index(Request $request)
    {
        $perPage = in_array((int) $request->integer('per_page', 25), self::PER_PAGE_OPTIONS, true)
            ? (int) $request->integer('per_page', 25)
            : 25;

        $query = Activity::with(['causer', 'subject'])
            ->latest();

        // — Filter: Pencarian teks —
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('causer', function ($sub) use ($search) {
                      $sub->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // — Filter: Event type (created / updated / deleted) —
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // — Filter: Modul / Subject type —
        if ($request->filled('module')) {
            $query->where('subject_type', $request->module);
        }

        // — Filter: Tanggal (dari – sampai) —
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', CarbonImmutable::parse($request->date_from, ActivityLogTimestamp::timezone())->startOfDay());
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', CarbonImmutable::parse($request->date_to, ActivityLogTimestamp::timezone())->endOfDay());
        }

        // — Filter: User (causer) —
        if ($request->filled('user_id')) {
            $query->where('causer_id', $request->user_id);
        }

        $logs = $query->paginate($perPage)->withQueryString()->through(function ($log) {
            return [
                'id'           => $log->id,
                'description'  => $log->description,
                'subject_type' => self::SUBJECT_LABELS[$log->subject_type] ?? class_basename($log->subject_type),
                'event'        => $log->event,
                'event_label'  => self::EVENT_LABELS[$log->event] ?? ucfirst($log->event),
                'causer'       => $log->causer ? $log->causer->name : 'Sistem/Seeder',
                'causer_id'    => $log->causer_id,
                'ip_address'   => $log->properties['ip'] ?? 'N/A',
                'created_at'   => ActivityLogTimestamp::make($log->created_at),
                'properties'   => $this->formatProperties($log->properties),
                'target_url'   => $this->generateTargetUrl($log),
            ];
        });

        // Data untuk filter dropdowns
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

        $events = Activity::select('event')
            ->distinct()
            ->whereNotNull('event')
            ->pluck('event')
            ->map(fn($evt) => [
                'value' => $evt,
                'label' => self::EVENT_LABELS[$evt] ?? ucfirst($evt),
            ])
            ->values();

        $users = Activity::select('causer_id', 'causer_type')
            ->distinct()
            ->whereNotNull('causer_id')
            ->whereNotNull('causer_type')
            ->get()
            ->map(function ($log) {
                $causer = $log->causer;
                if (!$causer) return null;
                return [
                    'value' => $log->causer_id,
                    'label' => $causer->name,
                ];
            })
            ->filter()
            ->unique('value')
            ->sortBy('label')
            ->values();

        return Inertia::render('Superadmin/ActivityLogs/Index', [
            'logs'    => $logs,
            'filters' => $request->only(['search', 'event', 'module', 'date_from', 'date_to', 'user_id', 'per_page']),
            'filterOptions' => [
                'modules' => $modules,
                'events'  => $events,
                'users'   => $users,
                'perPageOptions' => self::PER_PAGE_OPTIONS,
            ],
        ]);
    }

    private function formatProperties($properties)
    {
        if (empty($properties)) return $properties;

        $formatted = clone collect($properties);
        $data = $formatted->toArray();

        if (isset($data['attributes'])) {
            $data['attributes'] = $this->resolveValues($data['attributes']);
        }

        if (isset($data['old'])) {
            $data['old'] = $this->resolveValues($data['old']);
        }

        if (!isset($data['attributes']) && !isset($data['old'])) {
            $data = $this->resolveValues($data);
        }

        return $data;
    }

    private function resolveValues($attributes)
    {
        $newAttributes = [];
        foreach ($attributes as $key => $value) {
            if (in_array($key, ['ip', 'user_agent'])) {
                $newAttributes[$key] = $value;
                continue;
            }

            $newAttributes[$key] = $this->formatValue($key, $value);
        }
        return $newAttributes;
    }

    private function formatValue($key, $value)
    {
        if (is_null($value)) return '-';
        if (is_array($value)) return json_encode($value);

        // 1. Cek Foreign Keys
        if ($key === 'bendera_id') {
            $model = \App\Models\Bendera::find($value);
            return $model ? $model->name : "ID: $value (Terhapus Permanent)";
        }
        if ($key === 'mandor_id') {
            $model = \App\Models\Mandor::find($value);
            return $model ? $model->name : "ID: $value (Terhapus Permanent)";
        }
        if ($key === 'expense_type_id') {
            $model = \App\Models\ExpenseType::find($value);
            return $model ? $model->name : "ID: $value (Terhapus Permanent)";
        }
        if ($key === 'project_id') {
            $model = \App\Models\Project::withTrashed()->find($value);
            return $model ? $model->name : "ID: $value (Terhapus Permanent)";
        }
        if ($key === 'user_id' || $key === 'approved_by' || $key === 'rejected_by') {
            $model = \App\Models\User::find($value);
            return $model ? $model->name : "ID: $value (Terhapus Permanent)";
        }

        // 2. Cek Format Uang
        if (in_array($key, ['amount', 'nominal', 'total', 'price', 'unit_price', 'total_price'])) {
            return 'Rp ' . number_format((float)$value, 0, ',', '.');
        }

        // 3. Cek Format Tanggal
        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
            try {
                return ActivityLogTimestamp::formatDateString($value);
            } catch (\Exception $e) {
                return $value;
            }
        }

        // 4. Cek Boolean
        if (is_bool($value)) {
            return $value ? 'Ya' : 'Tidak';
        }
        if ($key === 'is_active') {
            return $value ? 'Aktif' : 'Non-Aktif';
        }

        return $value;
    }

    /**
     * Membuat link menuju data yang diubah.
     * Wrapped dalam try-catch agar tidak pernah menyebabkan 500/404 error.
     */
    private function generateTargetUrl($log)
    {
        // Jika subject_type tidak ada, tidak ada link valid
        if (!$log->subject_type || !$log->subject_id) {
            return null;
        }

        try {
            switch ($log->subject_type) {
                case 'App\Models\User':
                    $user = $log->subject ?? \App\Models\User::find($log->subject_id);
                    return $user ? route('superadmin.users.index', ['search' => $user->name]) : null;

                case 'App\Models\Project':
                    $project = $log->subject ?? \App\Models\Project::withTrashed()->find($log->subject_id);
                    return $project ? route('projectexpense.projects.show', $project->slug ?? $project->id) : null;

                case 'App\Models\Mandor':
                    return route('projectexpense.mandors.show', $log->subject_id);

                case 'App\Models\Expense':
                    $expense = $log->subject ?? \App\Models\Expense::find($log->subject_id);
                    if ($expense && $expense->project_id) {
                        $project = \App\Models\Project::withTrashed()->find($expense->project_id);
                        return $project ? route('projectexpense.projects.show', $project->slug ?? $project->id) : null;
                    }
                    return null;

                case 'App\Models\Bendera':
                    return route('projectexpense.benderas.index');

                case 'App\Models\ExpenseType':
                    return route('projectexpense.expense-types.index');

                case 'App\Models\PlantTransaction':
                    return route('kas.dashboard');

                case 'App\Models\CashSource':
                    return route('kas.sources.index');

                case 'App\Models\CashExpenseType':
                    return route('kas.expense-types.index');

                case 'App\Models\Delivery\DeliveryProject':
                    $project = $log->subject ?? \App\Models\Delivery\DeliveryProject::withTrashed()->find($log->subject_id);
                    return $project ? route('delivery.projects.show', $project->slug ?? $project->id) : null;

                case 'App\Models\Delivery\DeliveryShipment':
                    $shipment = $log->subject ?? \App\Models\Delivery\DeliveryShipment::withTrashed()->find($log->subject_id);
                    if ($shipment && $shipment->delivery_project_id) {
                        $project = \App\Models\Delivery\DeliveryProject::withTrashed()->find($shipment->delivery_project_id);
                        return $project ? route('delivery.projects.show', $project->slug ?? $project->id) : null;
                    }
                    return null;

                case 'App\Models\Delivery\Customer':
                    $customer = $log->subject ?? \App\Models\Delivery\Customer::withTrashed()->find($log->subject_id);
                    return $customer ? route('delivery.customers.show', $customer->slug ?? $customer->id) : null;

                case 'App\Models\Delivery\ConcreteGrade':
                    return route('delivery.concrete-grades.index');

                default:
                    return null;
            }
        } catch (\Exception $e) {
            return null;
        }
    }
}
