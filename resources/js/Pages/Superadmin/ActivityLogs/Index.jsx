import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PageHeader from '@/Components/PageHeader';
import { DataTable, Badge, SearchInput } from '@/Components/ui';
import { useState, useEffect } from 'react';

export default function Index({ logs, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(
                    route('superadmin.activity_logs.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

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
        if (!properties) return <p className="text-gray-500">Tidak ada detail perubahan.</p>;
        
        const isStandardLog = properties.old || properties.attributes;

        if (isStandardLog) {
            const oldData = properties.old || {};
            const newData = properties.attributes || {};
            const keys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])]
                .filter(key => key !== 'ip' && key !== 'user_agent');

            if (keys.length === 0) return <p className="text-gray-500">Tidak ada atribut yang berubah.</p>;

            return (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Field</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Lama</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Baru</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {keys.map((key) => (
                                <tr key={key}>
                                    <td className="px-4 py-2 font-medium text-gray-700">{key}</td>
                                    <td className="px-4 py-2 text-red-600 bg-red-50 break-all">
                                        {JSON.stringify(oldData[key]) || '-'}
                                    </td>
                                    <td className="px-4 py-2 text-green-600 bg-green-50 break-all">
                                        {JSON.stringify(newData[key]) || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Flat Properties
        const keys = Object.keys(properties).filter(key => key !== 'ip' && key !== 'user_agent');
        if (keys.length === 0) return <p className="text-gray-500">Tidak ada detail tambahan.</p>;
        
        return (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Info Tambahan</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nilai</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {keys.map((key) => (
                            <tr key={key}>
                                <td className="px-4 py-2 font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</td>
                                <td className="px-4 py-2 text-gray-600 break-all">
                                    {typeof properties[key] === 'object' ? JSON.stringify(properties[key]) : String(properties[key])}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Event badge color
    const eventVariant = (event) => {
        if (event === 'created') return 'green';
        if (event === 'deleted') return 'red';
        return 'yellow';
    };

    const columns = [
        {
            key: 'created_at',
            label: 'Waktu',
            render: (row) => (
                <span className="text-gray-500 whitespace-nowrap">{row.created_at}</span>
            ),
        },
        {
            key: 'causer',
            label: 'User (Pelaku)',
            render: (row) => (
                <span className="font-medium text-gray-900">{row.causer}</span>
            ),
        },
        {
            key: 'ip_address',
            label: 'IP Address',
            render: (row) => (
                <span className="text-gray-500 font-mono text-xs">{row.ip_address}</span>
            ),
        },
        {
            key: 'subject_type',
            label: 'Modul',
            render: (row) => (
                <Badge variant="blue" size="md">{row.subject_type}</Badge>
            ),
        },
        {
            key: 'event',
            label: 'Aksi',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={eventVariant(row.event)} size="sm">
                        {row.event}
                    </Badge>
                    <button 
                        onClick={() => openDetailModal(row)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium text-left transition-colors"
                    >
                        Lihat Detail
                    </button>
                </div>
            ),
        },
        {
            key: 'target_url',
            label: 'Akses',
            render: (row) => (
                row.target_url ? (
                    <Link 
                        href={row.target_url} 
                        className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                        <span>Buka</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </Link>
                ) : (
                    <span className="text-gray-300 text-sm">N/A</span>
                )
            ),
        },
    ];

    return (
        <BendaharaLayout>
            <Head title="Log Aktivitas" />

            <div className="space-y-6">
                <PageHeader title="Log Aktivitas Sistem" />

                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Cari user atau deskripsi..."
                    maxWidth="max-w-sm"
                />

                <DataTable
                    columns={columns}
                    data={logs.data}
                    emptyMessage="Belum ada aktivitas terekam."
                    pagination={logs.links}
                    compact
                />
            </div>

            {/* Modal Detail */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Detail Aktivitas
                    </h2>
                    
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs mb-0.5">Waktu</span>
                                    <span className="font-semibold">{selectedLog.created_at}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs mb-0.5">IP Address</span>
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{selectedLog.ip_address}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 block text-xs mb-0.5">User-Agent</span>
                                    <span className="text-xs text-gray-600 break-all">{selectedLog.properties?.user_agent || '-'}</span>
                                </div>
                            </div>

                            {selectedLog.properties?.context && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-3">Informasi Transaksi</h3>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Judul</span>
                                            <span className="font-medium text-gray-900">{selectedLog.properties.context.title}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Nominal</span>
                                            <span className="font-medium text-gray-900">{selectedLog.properties.context.amount}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Tanggal</span>
                                            <span className="font-medium text-gray-900">{selectedLog.properties.context.transacted_at}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Tipe Biaya</span>
                                            <span className="font-medium text-gray-900">{selectedLog.properties.context.expense_type}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500 text-xs block">Proyek</span>
                                            <span className="font-medium text-gray-900">{selectedLog.properties.context.project}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">Perubahan Data:</h3>
                                {renderChanges(selectedLog.properties)}
                            </div>
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