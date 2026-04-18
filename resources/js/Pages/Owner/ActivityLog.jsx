import React, { useState, useCallback, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import DataTable from '@/Components/ui/DataTable';
import Badge from '@/Components/ui/Badge';
import Card from '@/Components/ui/Card';
import ActivityTimestamp from '@/Components/ActivityTimestamp';
import PageHeader from '@/Components/PageHeader';

// ─── Event severity → Badge variant mapping ─────────────────────────────────
const SEVERITY_VARIANT = {
    success: 'green',
    warning: 'yellow',
    danger:  'red',
    info:    'blue',
    neutral: 'gray',
};

// ─── Event icon ──────────────────────────────────────────────────────────────
const EventIcon = ({ severity }) => {
    const icons = {
        success: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
        warning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
        danger:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
        info:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    };
    const colorMap = {
        success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
        warning: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
        danger:  'text-red-500 bg-red-50 dark:bg-red-500/10',
        info:    'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
        neutral: 'text-gray-500 bg-gray-50 dark:bg-gray-500/10',
    };
    return (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[severity] ?? colorMap.neutral}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icons[severity] ?? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
        </div>
    );
};

// ─── Filter Bar ──────────────────────────────────────────────────────────────
const FilterBar = ({ filters, filterOptions, onFilter }) => {
    const [local, setLocal] = useState({
        search: filters.search ?? '',
        event: filters.event ?? '',
        module: filters.module ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    useEffect(() => {
        setLocal({
            search: filters.search ?? '',
            event: filters.event ?? '',
            module: filters.module ?? '',
            date_from: filters.date_from ?? '',
            date_to: filters.date_to ?? '',
        });
    }, [filters.search, filters.event, filters.module, filters.date_from, filters.date_to]);

    const handleChange = (key, value) => {
        const updated = { ...local, [key]: value };
        setLocal(updated);
        onFilter(updated);
    };

    const reset = () => {
        const empty = { search: '', event: '', module: '', date_from: '', date_to: '' };
        setLocal(empty);
        onFilter(empty);
    };

    const hasFilters = Object.values(local).some(Boolean);

    return (
        <Card padding="p-4" className="mb-5">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Search */}
                <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700/40 bg-gray-50 dark:bg-[#1a1a2e] flex-1 min-w-[200px]">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        id="audit-search"
                        type="text"
                        value={local.search ?? ''}
                        onChange={e => handleChange('search', e.target.value)}
                        placeholder="Cari deskripsi atau nama user…"
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 min-w-0"
                    />
                </div>

                {/* Event filter */}
                <select
                    id="audit-event-filter"
                    value={local.event ?? ''}
                    onChange={e => handleChange('event', e.target.value)}
                    className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700/40 bg-gray-50 dark:bg-[#1a1a2e] text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                >
                    <option value="">Semua Aksi</option>
                    {filterOptions.events.map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                </select>

                {/* Module filter */}
                <select
                    id="audit-module-filter"
                    value={local.module ?? ''}
                    onChange={e => handleChange('module', e.target.value)}
                    className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700/40 bg-gray-50 dark:bg-[#1a1a2e] text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 max-w-[200px]"
                >
                    <option value="">Semua Modul</option>
                    {filterOptions.modules.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>

                {/* Date range */}
                <input
                    id="audit-date-from"
                    type="date"
                    value={local.date_from ?? ''}
                    onChange={e => handleChange('date_from', e.target.value)}
                    className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700/40 bg-gray-50 dark:bg-[#1a1a2e] text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                />
                <span className="self-center text-gray-400 text-xs hidden sm:block">→</span>
                <input
                    id="audit-date-to"
                    type="date"
                    value={local.date_to ?? ''}
                    onChange={e => handleChange('date_to', e.target.value)}
                    className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700/40 bg-gray-50 dark:bg-[#1a1a2e] text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                />

                {/* Reset */}
                {hasFilters && (
                    <button
                        id="audit-reset-filter"
                        onClick={reset}
                        className="h-9 px-4 rounded-xl border border-gray-200 dark:border-gray-700/40 bg-white dark:bg-[#222238] text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors flex items-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reset
                    </button>
                )}
            </div>
        </Card>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ActivityLog({ logs, filters, filterOptions }) {
    const debounceRef = React.useRef(null);
    const perPageOptions = filterOptions.perPageOptions ?? [20, 50, 100, 200];
    const currentPerPage = Number(filters.per_page ?? logs.per_page ?? perPageOptions[0]);

    const compactParams = useCallback((params) => {
        const nextParams = { ...params };

        Object.keys(nextParams).forEach((key) => {
            if (nextParams[key] === '' || nextParams[key] === null || nextParams[key] === undefined) {
                delete nextParams[key];
            }
        });

        return nextParams;
    }, []);

    const handleFilter = useCallback((newFilters) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('owner.audit-log'), compactParams({ ...newFilters, per_page: currentPerPage }), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);
    }, [compactParams, currentPerPage]);

    const handlePerPageChange = (event) => {
        router.get(route('owner.audit-log'), compactParams({ ...filters, per_page: event.target.value }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // ── DataTable columns definition ──────────────────────────────────────────
    const columns = [
        {
            key: 'created_at',
            label: 'Waktu',
            render: (row) => (
                <ActivityTimestamp value={row.created_at} className="min-w-[130px]" />
            ),
        },
        {
            key: 'event',
            label: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-2 min-w-[110px]">
                    <EventIcon severity={row.event_severity} />
                    <Badge variant={SEVERITY_VARIANT[row.event_severity] ?? 'gray'} dot>
                        {row.event_label}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'subject_type',
            label: 'Modul',
            render: (row) => (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/40 px-2.5 py-1 rounded-lg whitespace-nowrap">
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    {row.subject_type || '—'}
                </span>
            ),
        },
        {
            key: 'description',
            label: 'Deskripsi',
            render: (row) => (
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[260px] truncate" title={row.description}>
                    {row.description || '—'}
                </p>
            ),
        },
        {
            key: 'causer',
            label: 'Pengguna',
            render: (row) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {row.causer ? row.causer.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{row.causer}</p>
                        {row.causer_role && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{row.causer_role}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'ip_address',
            label: 'IP Address',
            align: 'right',
            render: (row) => (
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums">
                    {row.ip_address || 'N/A'}
                </span>
            ),
        },
    ];

    return (
        <OwnerLayout
            header={
                <PageHeader
                    title="Jejak Audit"
                    subtitle={`Pantau semua aktivitas sistem secara real-time. Menampilkan ${logs.total?.toLocaleString('id-ID') ?? 0} entri log.`}
                    badge={{ text: 'Read-Only', variant: 'yellow' }}
                />
            }
        >
            <Head title="Jejak Audit — Owner" />

            {/* ── Summary Stats ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Log',    value: logs.total?.toLocaleString('id-ID') ?? '—',                                       bg: 'from-indigo-50 dark:from-indigo-900/20 to-white dark:to-gray-900',  ibg: 'bg-indigo-100 dark:bg-indigo-900/40',  ic: 'text-indigo-600 dark:text-indigo-400' },
                    { label: 'Halaman',      value: `${logs.current_page} / ${logs.last_page}`,                                        bg: 'from-blue-50 dark:from-blue-900/20 to-white dark:to-gray-900',    ibg: 'bg-blue-100 dark:bg-blue-900/40',    ic: 'text-blue-600 dark:text-blue-400'   },
                    { label: 'Per Halaman',  value: logs.per_page,                                                                      bg: 'from-teal-50 dark:from-teal-900/20 to-white dark:to-gray-900',    ibg: 'bg-teal-100 dark:bg-teal-900/40',    ic: 'text-teal-600 dark:text-teal-400'   },
                    { label: 'Filter Aktif', value: ['search', 'event', 'module', 'date_from', 'date_to'].filter((key) => Boolean(filters[key])).length || 'Tidak ada', bg: 'from-amber-50 dark:from-amber-900/20 to-white dark:to-gray-900',   ibg: 'bg-amber-100 dark:bg-amber-900/40',   ic: 'text-amber-600 dark:text-amber-400'  },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br ${s.bg} p-4 shadow-sm`}>
                        <div className={`w-8 h-8 rounded-lg ${s.ibg} ${s.ic} flex items-center justify-center mb-2`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className={`text-xl font-extrabold tabular-nums ${s.ic.includes('text') ? s.ic : 'text-gray-900 dark:text-gray-100'}`}>{s.value}</p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Filter Bar ──────────────────────────────────────────────── */}
            <FilterBar filters={filters} filterOptions={filterOptions} onFilter={handleFilter} />
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan {logs.data?.length?.toLocaleString('id-ID') ?? 0} dari {logs.total?.toLocaleString('id-ID') ?? 0} log.
                </p>
                <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Per halaman</span>
                    <select
                        value={String(currentPerPage)}
                        onChange={handlePerPageChange}
                        className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-gray-700/40 dark:bg-[#1a1a2e] dark:text-gray-200"
                    >
                        {perPageOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* ── Data Table ──────────────────────────────────────────────── */}
            <DataTable
                columns={columns}
                data={logs.data ?? []}
                keyField="id"
                compact
                pagination={logs.links}
                emptyMessage="Tidak ada entri log yang sesuai filter."
                emptyIcon={
                    <svg className="w-10 h-10 text-gray-200 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                }
            />

            {/* ── Read-Only Footer ─────────────────────────────────────────── */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <svg className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Data log bersifat <strong className="text-gray-500 dark:text-gray-300">read-only</strong> dan tidak dapat dihapus atau dimodifikasi dari panel ini.
            </div>
        </OwnerLayout>
    );
}
