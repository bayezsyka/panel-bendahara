import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Dashboard({ 
    totalInKasBesar, totalOutKasBesar, balanceKasBesar, kasBesarTransactions,
    totalInKasKecil, totalOutKasKecil, balanceKasKecil, kasKecilTransactions,
}) {
    const [showExportModal, setShowExportModal] = useState(false);

    // Export Form State
    const { data: exportFilters, setData: setExportFilters } = useForm({
        start_date: '',
        end_date: '',
        filter_type: 'all',
        cash_type: ''
    });

    // Helper functions
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const handleExport = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (exportFilters.start_date) params.append('start_date', exportFilters.start_date);
        if (exportFilters.end_date) params.append('end_date', exportFilters.end_date);
        if (exportFilters.cash_type) params.append('cash_type', exportFilters.cash_type);
        
        if (exportFilters.filter_type !== 'all') {
            params.append('type', exportFilters.filter_type);
        }

        const url = `${route('kas.export-pdf')}?${params.toString()}`;
        window.open(url, '_blank');
        setShowExportModal(false);
    };

    return (
        <BendaharaLayout>
            <Head title="Dashboard Kas" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard Kas</h2>
                        <p className="text-sm text-gray-500 mt-1">Ringkasan dan riwayat transaksi kas besar & kecil</p>
                    </div>
                    {/* Placeholder Export Button logic kept but hidden if not needed yet */}
                    {/* 
                    <button 
                        onClick={() => setShowExportModal(true)} 
                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Export PDF
                    </button> 
                    */}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kas Besar Card */}
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-50/50 group-hover:bg-indigo-100/50 transition-colors"></div>
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Saldo Kas Besar</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatRupiah(balanceKasBesar)}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Masuk</p>
                                    <p className="font-semibold text-emerald-600">{formatRupiah(totalInKasBesar)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Keluar</p>
                                    <p className="font-semibold text-red-600">{formatRupiah(totalOutKasBesar)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kas Kecil Card */}
                    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-50/50 group-hover:bg-purple-100/50 transition-colors"></div>
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Saldo Kas Kecil</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatRupiah(balanceKasKecil)}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Masuk</p>
                                    <p className="font-semibold text-emerald-600">{formatRupiah(totalInKasKecil)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Keluar</p>
                                    <p className="font-semibold text-red-600">{formatRupiah(totalOutKasKecil)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Kas Besar Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Riwayat Kas Besar</h3>
                                <p className="text-xs text-gray-500 mt-1">10 Transaksi Terakhir</p>
                            </div>
                            <Link href={route('kas.kas-besar')} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
                                Lihat Semua &rarr;
                            </Link>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            {kasBesarTransactions && kasBesarTransactions.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {kasBesarTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{t.description}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {t.type === 'in' ? (t.cash_source?.name || 'Sumber Lain') : (t.cash_expense_type?.name || 'Biaya Lain')}
                                                    </p>
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    Belum ada transaksi di Kas Besar
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kas Kecil Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Riwayat Kas Kecil</h3>
                                <p className="text-xs text-gray-500 mt-1">10 Transaksi Terakhir</p>
                            </div>
                            <Link href={route('kas.kas-kecil')} className="text-sm text-purple-600 font-medium hover:text-purple-700 hover:underline">
                                Lihat Semua &rarr;
                            </Link>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            {kasKecilTransactions && kasKecilTransactions.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {kasKecilTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{t.description}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {t.type === 'in' ? (t.cash_source?.name || 'Internal Transfer/Lainnya') : (t.cash_expense_type?.name || 'Biaya Lain')}
                                                    </p>
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    Belum ada transaksi di Kas Kecil
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL EXPORT (Hidden for now unless needed, kept existing logic for future use) */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Export Laporan PDF</h2>
                    <form onSubmit={handleExport} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Dari Tanggal" />
                                <TextInput type="date" className="w-full mt-1" value={exportFilters.start_date} onChange={e => setExportFilters('start_date', e.target.value)} />
                            </div>
                            <div>
                                <InputLabel value="Sampai Tanggal" />
                                <TextInput type="date" className="w-full mt-1" value={exportFilters.end_date} onChange={e => setExportFilters('end_date', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Jenis Kas" />
                            <select 
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                value={exportFilters.cash_type}
                                onChange={e => setExportFilters('cash_type', e.target.value)}
                            >
                                <option value="">Semua (Kas Besar & Kecil)</option>
                                <option value="kas_besar">Hanya Kas Besar</option>
                                <option value="kas_kecil">Hanya Kas Kecil</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Jenis Transaksi" />
                            <select 
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                value={exportFilters.filter_type}
                                onChange={e => setExportFilters('filter_type', e.target.value)}
                            >
                                <option value="all">Semua Transaksi</option>
                                <option value="in">Hanya Kas Masuk</option>
                                <option value="out">Hanya Kas Keluar</option>
                                <option value="specific">Per Tipe Spesifik</option>
                            </select>
                        </div>

                        {exportFilters.filter_type === 'specific' && (
                            <div>
                                <InputLabel value="Pilih Tipe" />
                                <select 
                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                    value={exportFilters.expense_type_id}
                                    onChange={e => setExportFilters('expense_type_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Tipe --</option>
                                    {expenseTypes && expenseTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <SecondaryButton onClick={() => setShowExportModal(false)}>Batal</SecondaryButton>
                            <PrimaryButton>Download PDF</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
