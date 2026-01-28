import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
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

    // Helper untuk menampilkan perubahan JSON dengan rapi
    const renderChanges = (properties) => {
        if (!properties) return <p className="text-gray-500">Tidak ada detail perubahan.</p>;
        
        // Pengecekan apakah format log menggunakan old/attributes (Spatie standard)
        const isStandardLog = properties.old || properties.attributes;

        if (isStandardLog) {
            const oldData = properties.old || {};
            const newData = properties.attributes || {};

            // Filter keys yang penting saja (abaikan IP/UserAgent di view detail perubahan)
            const keys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])]
                .filter(key => key !== 'ip' && key !== 'user_agent');

            if (keys.length === 0) return <p className="text-gray-500">Tidak ada atribut yang berubah.</p>;

            return (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lama</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Baru</th>
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

        // Format Custom (Flat Properties) untuk Log Manual (seperti Export PDF)
        const keys = Object.keys(properties).filter(key => key !== 'ip' && key !== 'user_agent');
        if (keys.length === 0) return <p className="text-gray-500">Tidak ada detail tambahan.</p>;
        
        return (
             <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Info Tambahan</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
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

    return (
        <BendaharaLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Log Aktivitas Sistem</h2>}
        >
            <Head title="Log Aktivitas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Search Bar */}
                        <div className="mb-6 w-full sm:w-1/3">
                            <TextInput
                                type="text"
                                placeholder="Cari user atau deskripsi..."
                                className="w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User (Pelaku)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modul</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akses</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.created_at}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {log.causer}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                    {log.ip_address}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {log.subject_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold uppercase text-xs mb-1 
                                                            ${log.event === 'created' ? 'text-green-600' : 
                                                              log.event === 'deleted' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                            {log.event}
                                                        </span>
                                                        <button 
                                                            onClick={() => openDetailModal(log)}
                                                            className="text-indigo-600 hover:text-indigo-900 text-xs underline text-left"
                                                        >
                                                            Lihat Detail Perubahan
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {log.target_url ? (
                                                        <Link 
                                                            href={log.target_url} 
                                                            className="text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1"
                                                        >
                                                            <span>Buka</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                            </svg>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400 cursor-not-allowed">link N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                Belum ada aktivitas terekam.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-end gap-2">
                            {logs.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 border rounded text-sm ${link.active ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal Detail Perubahan */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Detail Aktivitas
                    </h2>
                    
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Waktu:</span>
                                    <span className="font-semibold">{selectedLog.created_at}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">IP Address:</span>
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{selectedLog.ip_address}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">User-Agent:</span>
                                    <span className="text-xs text-gray-600 break-all">{selectedLog.properties?.user_agent || '-'}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                {selectedLog.properties?.context && (
                                    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-3">
                                        <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">Informasi Transaksi</h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 text-xs block">Judul Transaksi</span>
                                                <span className="font-medium text-gray-900">{selectedLog.properties.context.title}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-xs block">Nominal</span>
                                                <span className="font-medium text-gray-900">{selectedLog.properties.context.amount}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-xs block">Tanggal Transaksi</span>
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

                                <h3 className="font-medium text-gray-800 mb-2">Perubahan Data:</h3>
                                {renderChanges(selectedLog.properties)}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Tutup
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

        </BendaharaLayout>
    );
}