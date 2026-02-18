import React, { useState, useRef, useEffect } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { SearchInput } from '@/Components/ui';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Calendar, Download } from 'lucide-react';

export default function Index({ shipments, selectedDate, prevDate, nextDate, filters = {} }) {
    const { auth } = usePage().props;
    const { can_edit } = auth.permissions || {};

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [direction, setDirection] = useState('none');
    const [animKey, setAnimKey] = useState(0);
    const dateInputRef = useRef(null);

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState('range');
    const { data: exportFilters, setData: setExportFilters } = useForm({
        start_date: selectedDate,
        end_date: selectedDate,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDateFull = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Handle Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(
                    route('delivery.shipments.index'),
                    { search: searchTerm, date: selectedDate },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDateChange = (e) => {
        setDirection('none');
        router.visit(route('delivery.shipments.index', { date: e.target.value, search: searchTerm }), { preserveScroll: true });
    };

    const changeDate = (days) => {
        setDirection(days > 0 ? 'right' : 'left');
        setAnimKey(prev => prev + 1);
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        const newDate = date.toISOString().split('T')[0];
        router.visit(route('delivery.shipments.index', { date: newDate, search: searchTerm }), { preserveScroll: true });
    };

    const changeMonth = (months) => {
        setDirection(months > 0 ? 'right' : 'left');
        setAnimKey(prev => prev + 1);
        const date = new Date(selectedDate);
        date.setMonth(date.getMonth() + months);
        const newDate = date.toISOString().split('T')[0];
        router.visit(route('delivery.shipments.index', { date: newDate, search: searchTerm }), { preserveScroll: true });
    };

    const handleExportToday = () => {
        const url = route('delivery.shipments.export-pdf', { 
            start_date: selectedDate, 
            end_date: selectedDate 
        });
        window.open(url, '_blank');
    };

    const handleOpenExportModal = (type) => {
        setExportType(type);
        setShowExportModal(true);
    };

    const handleExportProcess = (e) => {
        e.preventDefault();
        let params = {};
        
        if (exportType === 'range') {
            params.start_date = exportFilters.start_date;
            params.end_date = exportFilters.end_date;
        } else if (exportType === 'month') {
            const start = new Date(exportFilters.year, exportFilters.month - 1, 1);
            const end = new Date(exportFilters.year, exportFilters.month, 0);
            
            const formatDateParam = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            params.start_date = formatDateParam(start);
            params.end_date = formatDateParam(end);
        }

        const url = `${route('delivery.shipments.export-pdf')}?${new URLSearchParams(params).toString()}`;
        window.open(url, '_blank');
        setShowExportModal(false);
    };

    return (
        <BendaharaLayout>
            <Head title="Rekap Pengiriman Beton" />

            <div className="space-y-6 pb-20">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rekap Pengiriman</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daftar seluruh data pengiriman harian</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                         <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Cari surat jalan, mobil..."
                            className="w-full md:w-64"
                        />
                    </div>
                </div>

                {/* Controls Area */}
                <div className="bg-white dark:bg-[#222238] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                     <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Export Buttons */}
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <button onClick={() => handleOpenExportModal('range')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                                <Download className="w-4 h-4" /> Export Rentang
                            </button>
                            <button onClick={() => handleOpenExportModal('month')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                                <Calendar className="w-4 h-4" /> Export Bulan
                            </button>
                            <button onClick={handleExportToday} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors whitespace-nowrap">
                                <FileText className="w-4 h-4" /> Export Hari Ini
                            </button>
                        </div>
 
                         {/* Date Navigation */}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div className="flex gap-1">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors" title="Bulan Lalu">
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors" title="Kemarin">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div 
                                className="relative group cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors rounded-lg overflow-hidden"
                                onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.click()}
                            >
                                <input 
                                    ref={dateInputRef}
                                    type="date" 
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
                                />
                                <div className={`px-4 py-1.5 text-center min-w-[200px] transition-all duration-300 ${
                                    direction === 'left' ? 'animate-slide-left' : direction === 'right' ? 'animate-slide-right' : ''
                                }`} key={animKey}>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">{formatDateFull(selectedDate)}</p>
                                </div>
                            </div>
 
                            <div className="flex gap-1">
                                <button onClick={() => changeDate(1)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors" title="Besok">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors" title="Bulan Depan">
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SHIPMENTS TABLE */}
                <div className="bg-white dark:bg-[#222238] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Docket / Rit</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer / Project</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mutu</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobil / Supir</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Volume</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Total Harga</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {shipments.length > 0 ? (
                                    shipments.map((shipment) => (
                                        <tr key={shipment.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">#{shipment.docket_number || '-'}</span>
                                                    <span className="text-xs text-gray-500">Rit Ke-{shipment.rit_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{shipment.project?.customer?.name}</span>
                                                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{shipment.project?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                                    {shipment.concrete_grade?.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{shipment.vehicle_number || '-'}</span>
                                                    <span className="text-xs text-gray-500">{shipment.driver_name || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{shipment.volume} m³</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(shipment.total_price)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {can_edit && (
                                                    <Link 
                                                        href={route('delivery.shipments.edit', shipment.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <FileText className="w-12 h-12 text-gray-200 mb-4" />
                                                <p className="text-gray-500 font-medium">Tidak ada data pengiriman pada tanggal ini</p>
                                                {searchTerm && <p className="text-xs text-gray-400 mt-1">Coba hapus filter pencarian</p>}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {shipments.length > 0 && (
                                <tfoot className="bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50">
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-600 dark:text-gray-300">Total Hari Ini</td>
                                        <td className="px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400 text-base">
                                            {shipments.reduce((acc, curr) => acc + Number(curr.volume), 0).toFixed(2)} m³
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400 text-base">
                                            {formatCurrency(shipments.reduce((acc, curr) => acc + Number(curr.total_price), 0))}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL EXPORT */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6 dark:bg-[#222238]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl transition-colors">
                            <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Export Laporan Pengiriman
                            </h2>
                            <p className="text-sm text-gray-500">Pilih rentang waktu untuk laporan PDF</p>
                        </div>
                    </div>

                    <form onSubmit={handleExportProcess} className="space-y-4">
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                            <button 
                                type="button"
                                onClick={() => setExportType('range')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${exportType === 'range' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500'}`}
                            >
                                Rentang Tanggal
                            </button>
                            <button 
                                type="button"
                                onClick={() => setExportType('month')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${exportType === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500'}`}
                            >
                                Per Bulan
                            </button>
                        </div>

                        {exportType === 'range' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Dari Tanggal" />
                                    <TextInput type="date" className="w-full mt-1" value={exportFilters.start_date} onChange={e => setExportFilters('start_date', e.target.value)} required />
                                </div>
                                <div>
                                    <InputLabel value="Sampai Tanggal" />
                                    <TextInput type="date" className="w-full mt-1" value={exportFilters.end_date} onChange={e => setExportFilters('end_date', e.target.value)} required />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Bulan" />
                                    <select 
                                        className="w-full mt-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={exportFilters.month}
                                        onChange={e => setExportFilters('month', e.target.value)}
                                        required
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel value="Tahun" />
                                    <TextInput 
                                        type="number" 
                                        className="w-full mt-1" 
                                        value={exportFilters.year} 
                                        onChange={e => setExportFilters('year', e.target.value)} 
                                        required 
                                        min="2020" 
                                        max="2030"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-8">
                            <SecondaryButton onClick={() => setShowExportModal(false)}>Batal</SecondaryButton>
                            <PrimaryButton className="gap-2">
                                <Download className="w-4 h-4" />
                                Download Laporan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-left {
                    0% { transform: translateX(20px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes slide-right {
                    0% { transform: translateX(-20px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-left { animation: slide-left 0.3s ease-out; }
                .animate-slide-right { animation: slide-right 0.3s ease-out; }
            `}} />
        </BendaharaLayout>
    );
}
