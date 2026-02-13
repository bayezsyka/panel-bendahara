import React, { useState, useRef, useEffect } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Link changed to router
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Select } from '@/Components/ui';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Calendar, Download, Plus, ArrowRightLeft } from 'lucide-react';

export default function KasBesar({ 
    selectedDate, prevDate, nextDate,
    saldoAwal, incomes, expenses,
    cashSources, cashExpenseTypes,
    totalIn, totalOut, balance, // Global totals
}) {
    // --- State & Form Logic (retained/adapted from original) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('in');
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        transaction_date: selectedDate, // Default to selected date
        type: 'in',
        cash_type: 'kas_besar',
        amount: '',
        description: '',
        cash_source_id: '',
        cash_expense_type_id: '',
    });

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const { data: transferData, setData: setTransferData, post: postTransfer, processing: transferProcessing, errors: transferErrors, reset: resetTransfer } = useForm({
        transaction_date: selectedDate,
        amount: '',
        description: '',
    });

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState('range');
    const { data: exportFilters, setData: setExportFilters } = useForm({
        start_date: '',
        end_date: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    // Formatters
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDateFull = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    const [direction, setDirection] = useState('none'); // 'left', 'right', 'none'
    const [animKey, setAnimKey] = useState(0);
    const dateInputRef = useRef(null);

    // Reset animation when page loads
    useEffect(() => {
        setDirection('none');
    }, [selectedDate]);

    // Date Navigation
    const handleDateChange = (e) => {
        setDirection('none');
        router.visit(route('kas.kas-besar', { date: e.target.value }), { preserveScroll: true });
    };

    const changeDate = (days) => {
        setDirection(days > 0 ? 'right' : 'left');
        setAnimKey(prev => prev + 1);
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        const newDate = date.toISOString().split('T')[0];
        router.visit(route('kas.kas-besar', { date: newDate }), { preserveScroll: true });
    };

    const changeMonth = (months) => {
        setDirection(months > 0 ? 'right' : 'left');
        setAnimKey(prev => prev + 1);
        const date = new Date(selectedDate);
        date.setMonth(date.getMonth() + months);
        const newDate = date.toISOString().split('T')[0];
        router.visit(route('kas.kas-besar', { date: newDate }), { preserveScroll: true });
    };

    // Modal Handlers
    const openModal = (type, transaction = null) => {
        setModalType(type);
        setEditingTransaction(transaction);
        if (transaction) {
            setData({
                transaction_date: transaction.transaction_date,
                type: transaction.type,
                cash_type: 'kas_besar',
                amount: transaction.amount,
                description: transaction.description,
                cash_source_id: transaction.cash_source_id || '',
                cash_expense_type_id: transaction.cash_expense_type_id || '',
            });
        } else {
            reset();
            setData(prev => ({
                ...prev,
                transaction_date: selectedDate, // Default to current view date
                type: type,
                cash_type: 'kas_besar',
                cash_source_id: (type === 'in' && cashSources.length > 0) ? cashSources[0].id : '',
                cash_expense_type_id: (type === 'out' && cashExpenseTypes.length > 0) ? cashExpenseTypes[0].id : '',
            }));
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTransaction) {
            put(route('kas.transactions.update', editingTransaction.id), { onSuccess: () => closeModal() });
        } else {
            post(route('kas.transactions.store'), { onSuccess: () => closeModal() });
        }
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        postTransfer(route('kas.transfer'), {
            onSuccess: () => { setIsTransferModalOpen(false); resetTransfer(); },
        });
    };

    const confirmDelete = (transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (transactionToDelete) {
            destroy(route('kas.transactions.destroy', transactionToDelete.id), {
                onSuccess: () => { setIsDeleteModalOpen(false); setTransactionToDelete(null); },
            });
        }
    };

    // Export Logic
    const handleExportToday = () => {
        const url = route('kas.export-pdf', { 
            start_date: selectedDate, 
            end_date: selectedDate, 
            cash_type: 'kas_besar' 
        });
        window.open(url, '_blank');
    };

    const handleOpenExportModal = (type) => {
        setExportType(type);
        setShowExportModal(true);
    };

    const handleExportProcess = (e) => {
        e.preventDefault();
        let params = { cash_type: 'kas_besar' };
        
        if (exportType === 'range') {
            params.start_date = exportFilters.start_date;
            params.end_date = exportFilters.end_date;
        } else if (exportType === 'month') {
            const start = new Date(exportFilters.year, exportFilters.month - 1, 1);
            const end = new Date(exportFilters.year, exportFilters.month, 0);
            
            // Format to YYYY-MM-DD using local time to avoid timezone shifts
            const formatDateParam = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            params.start_date = formatDateParam(start);
            params.end_date = formatDateParam(end);
        }

        const url = `${route('kas.export-pdf')}?${new URLSearchParams(params).toString()}`;
        window.open(url, '_blank');
        setShowExportModal(false);
    };

    // Calculations
    const totalIncomeToday = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpenseToday = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const endingBalance = saldoAwal + totalIncomeToday - totalExpenseToday;

    return (
        <BendaharaLayout>
            <Head title="Kas Besar" />

            <div className="space-y-6 pb-20">
                {/* Header Actions & Nav */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kas Besar</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Buku Kas Harian & Manajemen Transaksi</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                             <PrimaryButton onClick={() => openModal('in')} className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap gap-2">
                                <Plus className="w-4 h-4" /> Masuk
                            </PrimaryButton>
                            <PrimaryButton onClick={() => openModal('out')} className="bg-red-600 hover:bg-red-700 whitespace-nowrap gap-2">
                                <Plus className="w-4 h-4" /> Keluar
                            </PrimaryButton>
                             <SecondaryButton onClick={() => setIsTransferModalOpen(true)} className="gap-2 whitespace-nowrap hidden sm:flex">
                                <ArrowRightLeft className="w-4 h-4" /> Transfer
                            </SecondaryButton>
                        </div>
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

                {/* PEMASUKAN TABLE */}
                <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                            Pemasukan
                        </h3>
                         <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Pemasukan</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(totalIncomeToday + saldoAwal)}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#222238] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Jam</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-48">Jumlah</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {/* Saldo Awal */}
                                     <tr className="bg-emerald-50/30 dark:bg-emerald-900/10">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                                Saldo Awal
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">Sisa Saldo Kemarin</p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-emerald-400">
                                            {formatRupiah(saldoAwal)}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                    </tr>

                                    {/* Income Rows */}
                                    {incomes.length > 0 ? incomes.map((item) => (
                                         <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                {new Date(item.created_at || item.transaction_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description}</p>
                                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {item.cash_source?.name || 'Kas Masuk'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                                + {formatRupiah(item.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => openModal('in', item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => confirmDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                         <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400 text-sm">
                                                Tidak ada pemasukan lain hari ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50">
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-right bg-gray-50 dark:bg-gray-800/80 font-bold text-gray-600 dark:text-gray-300">Total Tersedia</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-lg">
                                            {formatRupiah(saldoAwal + totalIncomeToday)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                 {/* PENGELUARAN TABLE */}
                <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                            Pengeluaran
                        </h3>
                         <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatRupiah(totalExpenseToday)}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#222238] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Jam</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-48">Jumlah</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {/* Expense Rows */}
                                    {expenses.length > 0 ? expenses.map((item) => (
                                         <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                {new Date(item.created_at || item.transaction_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description}</p>
                                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {item.cash_expense_type?.name || 'Biaya Lain'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-red-600 dark:text-red-400">
                                                - {formatRupiah(item.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => openModal('out', item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => confirmDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                         <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400 text-sm">
                                                Tidak ada pengeluaran hari ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50">
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-600 dark:text-gray-300">Total Pengeluaran</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400 text-lg">
                                            - {formatRupiah(totalExpenseToday)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                 {/* SISA SALDO AKHIR CARD */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-indigo-100">Sisa Saldo Akhir Hari Ini</h3>
                            <p className="text-sm text-indigo-200 mt-1">Saldo Awal + Pemasukan - Pengeluaran</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black">{formatRupiah(endingBalance)}</h2>
                        </div>
                    </div>
                    
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
                </div>

            </div>

             {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="3xl">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        {editingTransaction ? 'Edit Transaksi' : (modalType === 'in' ? 'Tambah Pemasukan Kas Besar' : 'Tambah Pengeluaran Kas Besar')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel value="Tanggal" />
                                <TextInput type="date" className="w-full mt-1" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} required />
                                {errors.transaction_date && <div className="text-red-500 text-xs mt-1">{errors.transaction_date}</div>}
                            </div>

                            {modalType === 'in' ? (
                                <div>
                                    <InputLabel value="Sumber Dana" />
                                    <Select
                                        className="mt-1"
                                        value={data.cash_source_id}
                                        onChange={e => setData('cash_source_id', e.target.value)}
                                        placeholder="-- Pilih Sumber Dana --"
                                        options={cashSources.map(s => ({ value: s.id, label: s.name }))}
                                        required
                                    />
                                    {errors.cash_source_id && <div className="text-red-500 text-xs mt-1">{errors.cash_source_id}</div>}
                                </div>
                            ) : (
                                <div>
                                    <InputLabel value="Tipe Biaya" />
                                    <Select
                                        className="mt-1"
                                        value={data.cash_expense_type_id}
                                        onChange={e => setData('cash_expense_type_id', e.target.value)}
                                        placeholder="-- Pilih Tipe Biaya --"
                                        options={cashExpenseTypes.map(t => ({ value: t.id, label: t.name }))}
                                        required
                                    />
                                    {errors.cash_expense_type_id && <div className="text-red-500 text-xs mt-1">{errors.cash_expense_type_id}</div>}
                                </div>
                            )}

                            <div>
                                <InputLabel value="Nominal (Rp)" />
                                <TextInput type="number" className="w-full mt-1" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="0" required />
                                {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
                            </div>
                            
                            <div className="md:col-span-1"> 
                                <InputLabel value="Keterangan" />
                                <TextInput type="text" className="w-full mt-1" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Contoh: Deposit dari Bank" required />
                                {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                            <SecondaryButton onClick={closeModal} disabled={processing}>Batal</SecondaryButton>
                            <PrimaryButton className={modalType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Transfer Modal */}
            <Modal show={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Transfer ke Kas Kecil</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Pindahkan dana dari Kas Besar ke Kas Kecil. Tercatat sebagai pengeluaran di Kas Besar dan pemasukan di Kas Kecil.
                    </p>
                    <form onSubmit={handleTransferSubmit} className="space-y-4">
                        <div>
                            <InputLabel value="Tanggal Transfer" />
                            <TextInput type="date" className="w-full mt-1" value={transferData.transaction_date} onChange={e => setTransferData('transaction_date', e.target.value)} required />
                            {transferErrors.transaction_date && <div className="text-red-500 text-xs mt-1">{transferErrors.transaction_date}</div>}
                        </div>
                        <div>
                            <InputLabel value="Keterangan / Keperluan" />
                            <TextInput type="text" className="w-full mt-1" value={transferData.description} onChange={e => setTransferData('description', e.target.value)} placeholder="Contoh: Tambahan Kas Kecil" required />
                            {transferErrors.description && <div className="text-red-500 text-xs mt-1">{transferErrors.description}</div>}
                        </div>
                        <div>
                            <InputLabel value="Nominal Transfer (Rp)" />
                            <TextInput type="number" className="w-full mt-1" value={transferData.amount} onChange={e => setTransferData('amount', e.target.value)} placeholder="0" required />
                            {transferErrors.amount && <div className="text-red-500 text-xs mt-1">{transferErrors.amount}</div>}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton onClick={() => setIsTransferModalOpen(false)} disabled={transferProcessing}>Batal</SecondaryButton>
                            <PrimaryButton disabled={transferProcessing}>
                                {transferProcessing ? 'Memproses...' : 'Lakukan Transfer'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Hapus Transaksi?</h2>
                    <p className="text-gray-600 mb-6">Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            {processing ? 'Menghapus...' : 'Hapus Transaksi'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>

             {/* MODAL EXPORT */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6 dark:bg-[#222238]">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {exportType === 'range' ? 'Export Rentang Tanggal' : 'Export Bulanan'} Kas Besar
                    </h2>
                    <form onSubmit={handleExportProcess} className="space-y-4">
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

                        <div className="flex justify-end gap-2 mt-6">
                            <SecondaryButton onClick={() => setShowExportModal(false)}>Batal</SecondaryButton>
                            <PrimaryButton>Download Laporan PDF</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
