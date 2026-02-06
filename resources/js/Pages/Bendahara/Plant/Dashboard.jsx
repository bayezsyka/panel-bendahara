import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Dashboard({ totalInKasBesar, totalOutKasBesar, balanceKasBesar, totalInKasKecil, totalOutKasKecil, balanceKasKecil, expenseTypes }) {
    const [showExportModal, setShowExportModal] = useState(false);

    // Export Form State
    const { data: exportFilters, setData: setExportFilters } = useForm({
        start_date: '',
        end_date: '',
        filter_type: 'all',
        expense_type_id: '',
        cash_type: ''
    });

    // Helper functions
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

    const handleExport = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (exportFilters.start_date) params.append('start_date', exportFilters.start_date);
        if (exportFilters.end_date) params.append('end_date', exportFilters.end_date);
        if (exportFilters.cash_type) params.append('cash_type', exportFilters.cash_type);
        
        if (exportFilters.filter_type === 'specific') {
            params.append('expense_type_id', exportFilters.expense_type_id);
        } else if (exportFilters.filter_type !== 'all') {
            params.append('type', exportFilters.filter_type);
        }

        const url = `${route('bendahara.plant.export-pdf')}?${params.toString()}`;
        window.open(url, '_blank');
        setShowExportModal(false);
    };

    // Total keseluruhan
    const totalBalance = parseFloat(balanceKasBesar || 0) + parseFloat(balanceKasKecil || 0);

    return (
        <BendaharaLayout>
            <Head title="Dashboard Plant" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard Kantor Plant</h2>
                        <p className="text-sm text-gray-500 mt-1">Ringkasan arus kas kantor plant</p>
                    </div>
                    <button 
                        onClick={() => setShowExportModal(true)} 
                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export PDF
                    </button>
                </div>

                {/* Total Overview */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-white/5 rounded-full"></div>
                    <div className="relative">
                        <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-2">Total Saldo Keseluruhan</p>
                        <h3 className="text-4xl font-bold">{formatRupiah(totalBalance)}</h3>
                        <p className="text-indigo-200 text-xs mt-2">Kas Besar + Kas Kecil</p>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kas Besar Card */}
                    <Link 
                        href={route('bendahara.plant.kas-besar')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Kas Besar</h3>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Kas Masuk</span>
                                <span className="font-semibold text-emerald-600">{formatRupiah(totalInKasBesar)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Kas Keluar</span>
                                <span className="font-semibold text-red-600">{formatRupiah(totalOutKasBesar)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3 -mx-3">
                                <span className="text-sm font-medium text-gray-700">Saldo</span>
                                <span className="font-bold text-indigo-600 text-lg">{formatRupiah(balanceKasBesar)}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Kas Kecil Card */}
                    <Link 
                        href={route('bendahara.plant.kas-kecil')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Kas Kecil</h3>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Kas Masuk</span>
                                <span className="font-semibold text-emerald-600">{formatRupiah(totalInKasKecil)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Kas Keluar</span>
                                <span className="font-semibold text-red-600">{formatRupiah(totalOutKasKecil)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3 -mx-3">
                                <span className="text-sm font-medium text-gray-700">Saldo</span>
                                <span className="font-bold text-purple-600 text-lg">{formatRupiah(balanceKasKecil)}</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* MODAL EXPORT */}
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
