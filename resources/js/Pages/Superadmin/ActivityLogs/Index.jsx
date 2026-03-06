import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PageHeader from '@/Components/PageHeader';
import { DataTable, Badge, SearchInput, Select } from '@/Components/ui';
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function Index({ logs, filters, filterOptions }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [eventFilter, setEventFilter] = useState(filters.event || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module || '');
    const [userFilter, setUserFilter] = useState(filters.user_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(
        !!(filters.event || filters.module || filters.date_from || filters.date_to || filters.user_id)
    );

    // Build params function
    const buildParams = useCallback(() => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (eventFilter) params.event = eventFilter;
        if (moduleFilter) params.module = moduleFilter;
        if (userFilter) params.user_id = userFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        return params;
    }, [searchTerm, eventFilter, moduleFilter, userFilter, dateFrom, dateTo]);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(
                    route('superadmin.activity_logs.index'),
                    buildParams(),
                    { preserveState: true, replace: true }
                );
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Immediate apply on dropdown/date filters
    const applyFilters = useCallback((overrides = {}) => {
        const params = { ...buildParams(), ...overrides };
        // Clean empty keys
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(
            route('superadmin.activity_logs.index'),
            params,
            { preserveState: true, replace: true }
        );
    }, [buildParams]);

    const handleEventChange = (e) => {
        setEventFilter(e.target.value);
        applyFilters({ event: e.target.value });
    };
    const handleModuleChange = (e) => {
        setModuleFilter(e.target.value);
        applyFilters({ module: e.target.value });
    };
    const handleUserChange = (e) => {
        setUserFilter(e.target.value);
        applyFilters({ user_id: e.target.value });
    };
    const handleDateFromChange = (e) => {
        setDateFrom(e.target.value);
        applyFilters({ date_from: e.target.value });
    };
    const handleDateToChange = (e) => {
        setDateTo(e.target.value);
        applyFilters({ date_to: e.target.value });
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setEventFilter('');
        setModuleFilter('');
        setUserFilter('');
        setDateFrom('');
        setDateTo('');
        router.get(route('superadmin.activity_logs.index'), {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = useMemo(() => {
        return !!(searchTerm || eventFilter || moduleFilter || userFilter || dateFrom || dateTo);
    }, [searchTerm, eventFilter, moduleFilter, userFilter, dateFrom, dateTo]);

    const activeFilterCount = useMemo(() => {
        return [eventFilter, moduleFilter, userFilter, dateFrom, dateTo].filter(Boolean).length;
    }, [eventFilter, moduleFilter, userFilter, dateFrom, dateTo]);

    const openDetailModal = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLog(null);
    };

    // Helper for rendering changes
    const renderChanges = (properties) => {
        if (!properties) return <p className="text-gray-500 dark:text-gray-400 text-sm italic">Tidak ada detail perubahan.</p>;

        const isStandardLog = properties.old || properties.attributes;

        if (isStandardLog) {
            const oldData = properties.old || {};
            const newData = properties.attributes || {};
            const keys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])]
                .filter(key => key !== 'ip' && key !== 'user_agent');

            if (keys.length === 0) return <p className="text-gray-500 dark:text-gray-400 text-sm italic">Tidak ada atribut yang berubah.</p>;

            return (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700/40 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/40">
                        <thead className="bg-gray-50 dark:bg-[#1a1a2e]">
                            <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lama</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Baru</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#222238] divide-y divide-gray-100 dark:divide-gray-700/30 text-sm">
                            {keys.map((key) => {
                                const oldVal = oldData[key];
                                const newVal = newData[key];
                                const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                                return (
                                    <tr key={key} className={changed ? 'bg-amber-50/40 dark:bg-amber-500/5' : ''}>
                                        <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </td>
                                        <td className="px-4 py-2.5 text-red-600 dark:text-red-400 break-all">
                                            {oldVal !== undefined ? (typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>
                                        <td className="px-4 py-2.5 text-green-600 dark:text-green-400 break-all">
                                            {newVal !== undefined ? (typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Flat Properties
        const keys = Object.keys(properties).filter(key => key !== 'ip' && key !== 'user_agent');
        if (keys.length === 0) return <p className="text-gray-500 dark:text-gray-400 text-sm italic">Tidak ada detail tambahan.</p>;

        return (
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700/40 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/40">
                    <thead className="bg-gray-50 dark:bg-[#1a1a2e]">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Info</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nilai</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#222238] divide-y divide-gray-100 dark:divide-gray-700/30 text-sm">
                        {keys.map((key) => (
                            <tr key={key}>
                                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 capitalize whitespace-nowrap">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </td>
                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300 break-all">
                                    {typeof properties[key] === 'object' ? JSON.stringify(properties[key]) : String(properties[key])}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Event badge color + icon
    const eventConfig = (event) => {
        switch (event) {
            case 'created': return { variant: 'green', icon: '＋' };
            case 'deleted': return { variant: 'red', icon: '✕' };
            case 'updated': return { variant: 'yellow', icon: '✎' };
            default: return { variant: 'gray', icon: '•' };
        }
    };

    // Module badge variant
    const moduleVariant = (moduleType) => {
        const variantMap = {
            'Proyek': 'indigo',
            'Pengeluaran': 'red',
            'User': 'purple',
            'Mandor': 'emerald',
            'Bendera': 'yellow',
            'Transaksi Kas': 'blue',
            'Pengiriman': 'green',
        };
        return variantMap[moduleType] || 'gray';
    };

    const columns = [
        {
            key: 'created_at',
            label: 'Waktu',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-gray-100 text-xs font-medium whitespace-nowrap">
                        {row.created_at.split(' ').slice(0, 3).join(' ')}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-[11px] font-mono">
                        {row.created_at.split(' ').slice(3).join(' ')}
                    </span>
                </div>
            ),
        },
        {
            key: 'causer',
            label: 'Pelaku',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                        {row.causer?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[120px]">{row.causer}</span>
                </div>
            ),
        },
        {
            key: 'subject_type',
            label: 'Modul',
            render: (row) => (
                <Badge variant={moduleVariant(row.subject_type)} size="md">
                    {row.subject_type}
                </Badge>
            ),
        },
        {
            key: 'event',
            label: 'Aksi',
            render: (row) => {
                const config = eventConfig(row.event);
                return (
                    <Badge variant={config.variant} size="md" dot>
                        {row.event_label || row.event}
                    </Badge>
                );
            },
        },
        {
            key: 'description',
            label: 'Deskripsi',
            render: (row) => (
                <span className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 max-w-[200px]">
                    {row.description}
                </span>
            ),
        },
        {
            key: 'ip_address',
            label: 'IP',
            render: (row) => (
                <span className="text-gray-400 dark:text-gray-500 font-mono text-[11px] bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                    {row.ip_address}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => openDetailModal(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20 transition-all duration-150"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Detail
                    </button>
                    {row.target_url && (
                        <Link
                            href={row.target_url}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/20 transition-all duration-150"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            Buka
                        </Link>
                    )}
                </div>
            ),
        },
    ];

    return (
        <BendaharaLayout>
            <Head title="Log Aktivitas" />

            <div className="space-y-5">
                <PageHeader title="Log Aktivitas Sistem" />

                {/* Search + Filter Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Cari berdasarkan user atau deskripsi..."
                        maxWidth="max-w-sm"
                    />

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
                            inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border
                            ${showFilters
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                                : 'bg-white dark:bg-[#2a2a3d] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700/40 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                            }
                        `}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        </svg>
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 transition-all duration-200"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reset
                        </button>
                    )}
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-[#222238] rounded-xl border border-gray-200 dark:border-gray-700/40 shadow-sm p-5 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Filter Lanjutan</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Aksi</label>
                                <Select
                                    value={eventFilter}
                                    onChange={handleEventChange}
                                    options={filterOptions?.events || []}
                                    placeholder="Semua Aksi"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Modul</label>
                                <Select
                                    value={moduleFilter}
                                    onChange={handleModuleChange}
                                    options={filterOptions?.modules || []}
                                    placeholder="Semua Modul"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Pelaku</label>
                                <Select
                                    value={userFilter}
                                    onChange={handleUserChange}
                                    options={filterOptions?.users || []}
                                    placeholder="Semua User"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Dari Tanggal</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={handleDateFromChange}
                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700/40 shadow-sm text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-[#2a2a3d] focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={handleDateToChange}
                                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700/40 shadow-sm text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-[#2a2a3d] focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filter Tags */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Filter aktif:</span>
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 text-xs font-medium">
                                Pencarian: "{searchTerm}"
                                <button onClick={() => { setSearchTerm(''); applyFilters({ search: '' }); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-0.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        )}
                        {eventFilter && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-100 dark:border-amber-500/20">
                                Aksi: {filterOptions?.events?.find(e => e.value === eventFilter)?.label || eventFilter}
                                <button onClick={() => { setEventFilter(''); applyFilters({ event: '' }); }} className="text-amber-400 hover:text-amber-600 ml-0.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        )}
                        {moduleFilter && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20">
                                Modul: {filterOptions?.modules?.find(m => m.value === moduleFilter)?.label || moduleFilter}
                                <button onClick={() => { setModuleFilter(''); applyFilters({ module: '' }); }} className="text-indigo-400 hover:text-indigo-600 ml-0.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        )}
                        {userFilter && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium border border-purple-100 dark:border-purple-500/20">
                                User: {filterOptions?.users?.find(u => String(u.value) === String(userFilter))?.label || userFilter}
                                <button onClick={() => { setUserFilter(''); applyFilters({ user_id: '' }); }} className="text-purple-400 hover:text-purple-600 ml-0.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        )}
                        {(dateFrom || dateTo) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-500/20">
                                Tanggal: {dateFrom || '...'} → {dateTo || '...'}
                                <button onClick={() => { setDateFrom(''); setDateTo(''); applyFilters({ date_from: '', date_to: '' }); }} className="text-blue-400 hover:text-blue-600 ml-0.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={logs.data}
                    emptyMessage="Belum ada aktivitas terekam."
                    pagination={logs.links}
                    compact
                />
            </div>

            {/* Modal Detail */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Detail Aktivitas
                                </h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">#{selectedLog?.id}</p>
                            </div>
                        </div>
                    </div>

                    {selectedLog && (
                        <div className="space-y-5">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-xl p-3">
                                    <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase tracking-wider font-semibold mb-1">Waktu</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedLog.created_at}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-xl p-3">
                                    <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase tracking-wider font-semibold mb-1">Pelaku</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedLog.causer}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-xl p-3">
                                    <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase tracking-wider font-semibold mb-1">Modul</span>
                                    <Badge variant={moduleVariant(selectedLog.subject_type)} size="md">{selectedLog.subject_type}</Badge>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-xl p-3">
                                    <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase tracking-wider font-semibold mb-1">Aksi</span>
                                    <Badge variant={eventConfig(selectedLog.event).variant} size="md" dot>{selectedLog.event_label}</Badge>
                                </div>
                            </div>

                            {/* IP + User Agent */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-xl p-3">
                                    <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase tracking-wider font-semibold mb-1">IP Address</span>
                                    <span className="font-mono text-sm bg-white dark:bg-[#222238] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 inline-block">{selectedLog.ip_address}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-xl p-3">
                                    <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase tracking-wider font-semibold mb-1">User Agent</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 break-all leading-relaxed">{selectedLog.properties?.user_agent || '—'}</span>
                                </div>
                            </div>

                            {/* Context (if any) */}
                            {selectedLog.properties?.context && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl p-5">
                                    <h3 className="font-bold text-blue-900 dark:text-blue-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                        Informasi Transaksi
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                        {selectedLog.properties.context.title && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs block">Judul</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLog.properties.context.title}</span>
                                            </div>
                                        )}
                                        {selectedLog.properties.context.amount && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs block">Nominal</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLog.properties.context.amount}</span>
                                            </div>
                                        )}
                                        {selectedLog.properties.context.transacted_at && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs block">Tanggal</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLog.properties.context.transacted_at}</span>
                                            </div>
                                        )}
                                        {selectedLog.properties.context.expense_type && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs block">Tipe Biaya</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLog.properties.context.expense_type}</span>
                                            </div>
                                        )}
                                        {selectedLog.properties.context.project && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500 dark:text-gray-400 text-xs block">Proyek</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLog.properties.context.project}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Changes */}
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                    </svg>
                                    Perubahan Data
                                </h3>
                                {renderChanges(selectedLog.properties)}
                            </div>

                            {/* Link to resource */}
                            {selectedLog.target_url && (
                                <div className="pt-2">
                                    <Link
                                        href={selectedLog.target_url}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                        Buka Data Terkait
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Tutup</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}