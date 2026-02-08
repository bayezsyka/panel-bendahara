<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with(['causer', 'subject']) // causer adalah user yang melakukan aksi, subject adalah data yang dirubah
            ->latest();

        // Fitur Search sederhana
        if ($request->search) {
            $query->where('description', 'like', "%{$request->search}%")
                ->orWhereHas('causer', function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                });
        }

        $logs = $query->paginate(20)->through(function ($log) {
            return [
                'id' => $log->id,
                'description' => $log->description,
                'subject_type' => class_basename($log->subject_type),
                'event' => $log->event,
                'causer' => $log->causer ? $log->causer->name : 'Sistem/Seeder',
                'ip_address' => $log->properties['ip'] ?? 'N/A',
                'created_at' => $log->created_at->format('d M Y H:i:s'),
                'properties' => $this->formatProperties($log->properties),
                'target_url' => $this->generateTargetUrl($log),
            ];
        });

        return Inertia::render('Superadmin/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search']),
        ]);
    }

    private function formatProperties($properties)
    {
        if (empty($properties)) return $properties;

        // Clone properti agar tidak merubah aslinya secara referensi (meski array copy by value)
        $formatted = clone collect($properties);
        $data = $formatted->toArray();

        // Format 'attributes' (data baru)
        if (isset($data['attributes'])) {
            $data['attributes'] = $this->resolveValues($data['attributes']);
        }

        // Format 'old' (data lama)
        if (isset($data['old'])) {
            $data['old'] = $this->resolveValues($data['old']);
        }

        // Format custom properties (flat)
        // Jika tidak ada key 'attributes' atau 'old', asumsikan flat custom properties (kecuali key tertentu)
        if (!isset($data['attributes']) && !isset($data['old'])) {
            // Kita bisa parse semua kecuali ip, user_agent, dll
            $data = $this->resolveValues($data);
        }

        return $data;
    }

    private function resolveValues($attributes)
    {
        $newAttributes = [];
        foreach ($attributes as $key => $value) {
            // Skip internal keys
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
            return $model ? $model->name : "ID: $value (Terhapus)";
        }
        if ($key === 'mandor_id') {
            $model = \App\Models\Mandor::find($value);
            return $model ? $model->name : "ID: $value (Terhapus)";
        }
        if ($key === 'expense_type_id') {
            $model = \App\Models\ExpenseType::find($value);
            return $model ? $model->name : "ID: $value (Terhapus)";
        }
        if ($key === 'project_id') {
            $model = \App\Models\Project::find($value);
            return $model ? $model->name : "ID: $value (Terhapus)";
        }
        if ($key === 'user_id' || $key === 'approved_by' || $key === 'rejected_by') {
            $model = \App\Models\User::find($value);
            return $model ? $model->name : "ID: $value (Terhapus)";
        }

        // 2. Cek Format Uang
        if (in_array($key, ['amount', 'nominal', 'total'])) {
            return 'Rp ' . number_format((float)$value, 0, ',', '.');
        }

        // 3. Cek Format Tanggal (jika string cocok dengan format standar DB)
        // Regex sederhana untuk Y-m-d H:i:s atau Y-m-d
        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
            try {
                return \Carbon\Carbon::parse($value)->format('d M Y H:i');
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
     */
    private function generateTargetUrl($log)
    {
        // Jika data dihapus, tidak ada link valid
        if ($log->event === 'deleted') {
            return null;
        }

        // Mapping Model ke Route
        switch ($log->subject_type) {
            case 'App\Models\User':
                // User tidak punya halaman show khusus di kode Anda, mungkin tidak perlu link atau arahkan ke index
                return route('superadmin.users.index', ['search' => $log->properties['attributes']['name'] ?? '']);

            case 'App\Models\Project':
                return $log->subject ? route('projectexpense.projects.show', $log->subject) : null;

            case 'App\Models\Mandor':
                return $log->subject ? route('projectexpense.mandors.show', $log->subject) : null;

            case 'App\Models\Expense':
                return $log->subject && $log->subject->project_id
                    ? route('projectexpense.projects.show', $log->subject->project_id)
                    : null;

            case 'App\Models\ExpenseRequest':
                return route('projectexpense.expense-requests.index');

            default:
                return null;
        }
    }
}
