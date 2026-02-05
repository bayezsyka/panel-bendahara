import React, { useMemo, useState, useEffect } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function Show({ customer, transactions, grades = [], permissions = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState('bill'); // 'bill' or 'payment'
    const [editingTransaction, setEditingTransaction] = useState(null); // State for editing

    // Form for Adding/Editing Transaction
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        customer_id: customer.id,
        date: new Date().toISOString().split('T')[0],
        description: '',
        grade: '',
        volume: '',
        price_per_m3: '',
        bill_amount: 0,
        payment_amount: 0,
        notes: '',
    });

    // Handle Grade Selection
    const handleGradeChange = (e) => {
        const selectedGradeName = e.target.value;
        const selectedGrade = grades.find(g => g.name === selectedGradeName);
        
        setData(data => ({
            ...data,
            grade: selectedGradeName,
            price_per_m3: selectedGrade ? selectedGrade.price : data.price_per_m3 // Auto-fill price
        }));
    };

    // Auto-calculate bill amount
    useEffect(() => {
        if (transactionType === 'bill') {
            const vol = parseFloat(data.volume) || 0;
            const price = parseFloat(data.price_per_m3) || 0;
            setData('bill_amount', vol * price);
        }
    }, [data.volume, data.price_per_m3, transactionType]);

    
    // Formatting Helpers
    const formatCurrency = (val) => {
        if (!val || val === 0) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const formatCurrencyInput = (val) => {
         return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    // Calculate Running Balance
    const transactionsWithBalance = useMemo(() => {
        let runningBalance = 0;
        return transactions.map(trx => {
            const bill = parseFloat(trx.bill_amount) || 0;
            const payment = parseFloat(trx.payment_amount) || 0;
            runningBalance = runningBalance + bill - payment;
            return { ...trx, runningBalance };
        });
    }, [transactions]);

    const totalBalance = useMemo(() => {
        if (transactionsWithBalance.length === 0) return 0;
        return transactionsWithBalance[transactionsWithBalance.length - 1].runningBalance;
    }, [transactionsWithBalance]);


    const openModal = (type, transaction = null) => {
        setTransactionType(type);
        setEditingTransaction(transaction);
        setIsModalOpen(true);
        
        if (transaction) {
            reset({
                customer_id: customer.id,
                date: transaction.date,
                description: transaction.description,
                grade: transaction.grade || '',
                volume: transaction.volume || '',
                price_per_m3: transaction.price_per_m3 || '',
                bill_amount: transaction.bill_amount,
                payment_amount: transaction.payment_amount,
                notes: transaction.notes || '',
            });
        } else {
            reset({
                customer_id: customer.id,
                date: new Date().toISOString().split('T')[0],
                description: type === 'payment' ? 'Pembayaran' : '',
                grade: '',
                volume: '',
                price_per_m3: '',
                bill_amount: 0,
                payment_amount: 0,
                notes: '',
            });
        }
        clearErrors();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        
        const onSuccess = () => closeModal();

        if (editingTransaction) {
            put(route('receivable.transactions.update', editingTransaction.id), {
                onSuccess
            });
        } else {
            post(route('receivable.transactions.store'), {
                onSuccess
            });
        }
    };

    const handleDelete = (transactionId) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data transaksi ini akan dihapus permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('receivable.transactions.destroy', transactionId), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleDeleteCustomer = () => {
         Swal.fire({
            title: 'HAPUS CUSTOMER?',
            text: "PERINGATAN: Customer dan semua history transaksi akan dihapus permanen. Data tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'YA, HAPUS PERMANEN!',
            cancelButtonText: 'Batal',
            focusCancel: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('receivable.customers.destroy', customer.id));
            }
        });
    };

    const handleResetCustomer = () => {
         Swal.fire({
            title: 'RESET DATA CUSTOMER?',
            text: "Ini akan menghapus SEMUA transaksi dan mengosongkan nama customer. ID tetap dipertahankan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'YA, RESET DATA!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('customers.reset', customer.id));
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title={`Piutang - ${customer.name}`} />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* Header Section - Sleek & Compact */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link href={route('receivable.customers.index')} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-100 group">
                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm tracking-tighter">ID-{customer.id}</span>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{customer.name}</h1>
                            </div>
                            {customer.contact && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    {customer.contact}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-end">
                        {/* Stats Group */}
                        <div className="flex items-center gap-4 bg-gray-50/80 px-4 py-2.5 rounded-2xl border border-gray-100 shadow-inner">
                            <div className="flex flex-col items-end border-r border-gray-200 pr-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Vol</span>
                                <span className="text-xl font-black text-emerald-600 tracking-tighter leading-none">
                                    {transactionsWithBalance.reduce((acc, curr) => acc + (parseFloat(curr.volume) || 0), 0).toLocaleString('id-ID')} <span className="text-xs">m³</span>
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Sisa Hutang</span>
                                <span className={`text-xl font-black tracking-tighter leading-none ${totalBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(totalBalance)}
                                </span>
                            </div>
                        </div>

                        {/* Actions Group */}
                        <div className="flex items-center gap-2">
                            {(auth.user.role === 'superadmin' || auth.user.role === 'bendahara_utama') && (
                                <div className="flex gap-1 border-r border-gray-100 pr-2 mr-1">
                                    <button onClick={handleResetCustomer} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-100" title="Reset">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </button>
                                    <button onClick={handleDeleteCustomer} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100" title="Hapus">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            )}

                            <PrimaryButton onClick={() => openModal('payment')} className="!bg-emerald-600 hover:!bg-emerald-700 !rounded-xl !py-2 !px-4 !text-xs !font-black !uppercase tracking-widest shadow-md">
                                + Bayar
                            </PrimaryButton>
                            <PrimaryButton onClick={() => openModal('bill')} className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-xl !py-2 !px-4 !text-xs !font-black !uppercase tracking-widest shadow-md">
                                + Tagih
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                                    <th className="px-6 py-4 w-1/3">Keterangan</th>
                                    <th className="px-4 py-4 whitespace-nowrap text-center">Mutu</th>
                                    <th className="px-4 py-4 whitespace-nowrap text-right">Vol (m³)</th>
                                    <th className="px-4 py-4 whitespace-nowrap text-right">Harga Satuan</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-right text-gray-900 bg-gray-50">Tagihan</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-right text-green-700 bg-green-50">Pembayaran</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-800 bg-gray-50/30">Sisa Hutang</th>
                                    <th className="px-4 py-4 whitespace-nowrap text-center text-gray-400">#</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactionsWithBalance.length > 0 ? (
                                    transactionsWithBalance.map((trx) => (
                                        <tr 
                                            key={trx.id} 
                                            className={`transition-colors group ${
                                                parseFloat(trx.payment_amount) > 0 
                                                    ? 'bg-green-50/50 hover:bg-green-50' 
                                                    : 'hover:bg-gray-50/50'
                                            }`}
                                        >
                                            <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-700">
                                                {formatDate(trx.date)}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-gray-800">{trx.description}</div>
                                                {trx.notes && <div className="text-xs text-gray-400 mt-0.5 italic">{trx.notes}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600">
                                                {trx.grade || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                                                {trx.volume ? parseFloat(trx.volume).toLocaleString('id-ID') : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                                                {formatCurrency(trx.price_per_m3)}
                                            </td>
                                            <td className="px-6 py-3 text-right tabular-nums font-bold text-gray-900">
                                                {parseFloat(trx.bill_amount) > 0 ? formatCurrency(trx.bill_amount) : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-right tabular-nums font-bold text-green-600">
                                                {parseFloat(trx.payment_amount) > 0 ? formatCurrency(trx.payment_amount) : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-right tabular-nums font-bold text-gray-800 bg-gray-50/30">
                                                {formatCurrency(trx.runningBalance)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {permissions.can_update_transaction && (
                                                        <button 
                                                            onClick={() => openModal(parseFloat(trx.bill_amount) > 0 ? 'bill' : 'payment', trx)}
                                                            className="text-blue-500 hover:text-blue-700 p-1"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                    )}
                                                    {permissions.can_delete_transaction && (
                                                        <button 
                                                            onClick={() => handleDelete(trx.id)}
                                                            className="text-red-500 hover:text-red-700 p-1" 
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                    {!permissions.can_update_transaction && !permissions.can_delete_transaction && (
                                                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter italic">Read Only</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-400 bg-gray-50/50 italic">
                                            Belum ada transaksi untuk customer ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            
                            {transactionsWithBalance.length > 0 && (
                                <tfoot className="bg-gray-100 border-t border-gray-200 font-black">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right text-gray-500 uppercase tracking-widest text-xs">TOTAL</td>
                                        <td className="px-4 py-4 text-right text-gray-900 border-l border-gray-200 bg-gray-50/50">
                                            {
                                                transactionsWithBalance
                                                .reduce((acc, curr) => acc + (parseFloat(curr.volume) || 0), 0)
                                                .toLocaleString('id-ID')
                                            }
                                        </td>
                                        <td className="px-4 py-4"></td>
                                        <td className="px-6 py-4 text-right text-gray-900 bg-gray-50">
                                            {formatCurrency(transactionsWithBalance.reduce((acc, curr) => acc + parseFloat(curr.bill_amount), 0))}
                                        </td>
                                        <td className="px-6 py-4 text-right text-green-700 bg-green-50/50">
                                            {formatCurrency(transactionsWithBalance.reduce((acc, curr) => acc + parseFloat(curr.payment_amount), 0))}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-900 bg-gray-50/30">
                                            {formatCurrency(totalBalance)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Modal Transaksi (Tagihan & Pembayaran) */}
                 <Modal show={isModalOpen} onClose={closeModal}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            {editingTransaction 
                                ? `Edit ${transactionType === 'bill' ? 'Tagihan' : 'Pembayaran'}` 
                                : `Tambah ${transactionType === 'bill' ? 'Tagihan Baru' : 'Input Pembayaran'}`
                            }
                        </h2>

                        <form onSubmit={submit} className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="date" value="Tanggal" />
                                    <TextInput
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={data.date}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    <InputError message={errors.date} className="mt-2" />
                                </div>
                                
                                {transactionType === 'bill' && (
                                     <div>
                                        <InputLabel htmlFor="grade" value="Mutu Beton" />
                                        <select
                                            id="grade"
                                            name="grade"
                                            value={data.grade}
                                            onChange={handleGradeChange}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="">-- Pilih Mutu --</option>
                                            {grades.map(g => (
                                                <option key={g.id} value={g.name}>
                                                    {g.name} - {formatCurrencyInput(g.price)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.grade} className="mt-2" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value={transactionType === 'bill' ? "Keterangan / Lokasi" : "Keterangan Pembayaran"} />
                                <TextInput
                                    id="description"
                                    type="text"
                                    name="description"
                                    value={data.description}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={transactionType === 'bill' ? "Cor Jalan Blok A" : "Transfer BCA 01/02"}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {transactionType === 'bill' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="volume" value="Volume (m³)" />
                                            <TextInput
                                                id="volume"
                                                type="number"
                                                step="0.01"
                                                name="volume"
                                                value={data.volume}
                                                className="mt-1 block w-full text-right"
                                                onChange={(e) => setData('volume', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            <InputError message={errors.volume} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="price_per_m3" value="Harga Satuan (Rp)" />
                                            <TextInput
                                                id="price_per_m3"
                                                type="number"
                                                name="price_per_m3"
                                                value={data.price_per_m3}
                                                className="mt-1 block w-full text-right"
                                                onChange={(e) => setData('price_per_m3', e.target.value)}
                                                placeholder="0"
                                            />
                                            <InputError message={errors.price_per_m3} className="mt-2" />
                                        </div>
                                    </div>
                                    
                                    {/* Read Only Total Calculation */}
                                    <div className="bg-indigo-50 p-3 rounded-lg flex justify-between items-center border border-indigo-100">
                                        <span className="text-sm font-medium text-indigo-800">Total Tagihan</span>
                                        <span className="text-lg font-bold text-indigo-700">
                                            {formatCurrencyInput(data.bill_amount)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <InputLabel htmlFor="payment_amount" value="Nominal Pembayaran (Rp)" />
                                    <TextInput
                                        id="payment_amount"
                                        type="number"
                                        name="payment_amount"
                                        value={data.payment_amount}
                                        className="mt-1 block w-full text-right text-lg font-bold text-green-700"
                                        onChange={(e) => setData('payment_amount', e.target.value)}
                                        placeholder="0"
                                    />
                                    <InputError message={errors.payment_amount} className="mt-2" />
                                </div>
                            )}

                             <div>
                                <InputLabel htmlFor="notes" value="Catatan Tambahan (Opsional)" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={data.notes}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    rows="2"
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton onClick={closeModal} disabled={processing}>
                                    Batal
                                </SecondaryButton>
                                <PrimaryButton disabled={processing} className={transactionType === 'bill' ? "!bg-indigo-600 hover:!bg-indigo-700" : "!bg-green-600 hover:!bg-green-700"}>
                                    {editingTransaction ? 'Simpan Perubahan' : (transactionType === 'bill' ? 'Simpan Tagihan' : 'Simpan Pembayaran')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </BendaharaLayout>
    );
}
