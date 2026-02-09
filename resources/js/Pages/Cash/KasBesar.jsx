import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function KasBesar({ transactions, cashSources, cashExpenseTypes, totalIn, totalOut, balance, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('in'); // 'in' or 'out'
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'in',
        cash_type: 'kas_besar',
        amount: '',
        description: '',
        cash_source_id: '',
        cash_expense_type_id: '',
    });

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    
    // Transfer form
    const { data: transferData, setData: setTransferData, post: postTransfer, processing: transferProcessing, errors: transferErrors, reset: resetTransfer } = useForm({
        transaction_date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
    });

    // Formatters
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Handlers
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
            // Default values for new transaction
            reset();
            setData(prev => ({
                ...prev,
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
            put(route('kas.transactions.update', editingTransaction.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('kas.transactions.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        postTransfer(route('kas.transfer'), {
            onSuccess: () => {
                setIsTransferModalOpen(false);
                resetTransfer();
            },
        });
    };

    const confirmDelete = (transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (transactionToDelete) {
            destroy(route('kas.transactions.destroy', transactionToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setTransactionToDelete(null);
                },
            });
        }
    };

    return (
        <BendaharaLayout>
            <Head title="Kas Besar" />

            <div className="space-y-6">
                {/* Header & Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <Link href={route('kas.dashboard')} className="text-gray-500 hover:text-indigo-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h2 className="text-2xl font-bold text-gray-900">Kas Besar</h2>
                        </div>
                        <p className="text-gray-500">Kelola pemasukan dan pengeluaran kas besar.</p>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                         <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
                         <div className="relative z-10">
                            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Saldo Saat Ini</p>
                            <h3 className="text-3xl font-bold">{formatRupiah(balance)}</h3>
                         </div>
                    </div>
                </div>

                {/* Actions & Summary */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex gap-3 overflow-x-auto pb-1 sm:pb-0">
                        <PrimaryButton onClick={() => openModal('in')} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 whitespace-nowrap">
                            + Pemasukan
                        </PrimaryButton>
                        <PrimaryButton onClick={() => openModal('out')} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 whitespace-nowrap">
                            - Pengeluaran
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setIsTransferModalOpen(true)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 whitespace-nowrap">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Transfer ke Kas Kecil
                        </SecondaryButton>
                    </div>
                    <div className="flex gap-6 text-sm whitespace-nowrap">
                        <div>
                            <span className="text-gray-500 block text-xs">Total Masuk</span>
                            <span className="font-semibold text-emerald-600">{formatRupiah(totalIn)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs">Total Keluar</span>
                            <span className="font-semibold text-red-600">{formatRupiah(totalOut)}</span>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori/Tipe</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Nominal</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions && transactions.length > 0 ? (
                                    transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                     {t.type === 'in' ? 'Masuk' : 'Keluar'}
                                                 </span>
                                                 <div className="text-xs text-gray-400 mt-1">
                                                     {t.type === 'in' ? (t.cash_source?.name || 'Sumber Lain') : (t.cash_expense_type?.name || 'Biaya Lain')}
                                                 </div>
                                             </td>
                                             <td className="px-6 py-4 text-sm text-gray-800 font-medium">{t.description}</td>
                                             <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                 {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                                             </td>
                                             <td className="px-6 py-4 text-center whitespace-nowrap">
                                                 <button onClick={() => openModal(t.type, t)} className="text-indigo-600 hover:text-indigo-900 mx-2 text-sm">Edit</button>
                                                 <button onClick={() => confirmDelete(t)} className="text-red-600 hover:text-red-900 mx-2 text-sm">Hapus</button>
                                             </td>
                                         </tr>
                                     ))
                                 ) : (
                                     <tr>
                                         <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                                             Belum ada transaksi
                                         </td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                     </div>
                 </div>
             </div>

             {/* Modal Form */}
             <Modal show={isModalOpen} onClose={closeModal}>
                 <div className="p-6">
                     <h2 className="text-lg font-bold text-gray-900 mb-4">
                         {editingTransaction ? 'Edit Transaksi' : (modalType === 'in' ? 'Tambah Pemasukan Kas Besar' : 'Tambah Pengeluaran Kas Besar')}
                     </h2>
                     <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                             <InputLabel value="Tanggal" />
                             <TextInput type="date" className="w-full mt-1" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} required />
                             {errors.transaction_date && <div className="text-red-500 text-xs mt-1">{errors.transaction_date}</div>}
                         </div>

                         {modalType === 'in' ? (
                            <div>
                                <InputLabel value="Sumber Dana" />
                                <select 
                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.cash_source_id}
                                    onChange={e => setData('cash_source_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Sumber Dana --</option>
                                    {cashSources.map(source => (
                                        <option key={source.id} value={source.id}>{source.name}</option>
                                    ))}
                                </select>
                                {errors.cash_source_id && <div className="text-red-500 text-xs mt-1">{errors.cash_source_id}</div>}
                            </div>
                         ) : (
                            <div>
                                <InputLabel value="Tipe Biaya" />
                                <select 
                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.cash_expense_type_id}
                                    onChange={e => setData('cash_expense_type_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Tipe Biaya --</option>
                                    {cashExpenseTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                {errors.cash_expense_type_id && <div className="text-red-500 text-xs mt-1">{errors.cash_expense_type_id}</div>}
                            </div>
                         )}

                        <div>
                            <InputLabel value="Keterangan" />
                            <TextInput type="text" className="w-full mt-1" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Contoh: Deposit dari Bank / Biaya Operasional" required />
                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                        </div>

                        <div>
                            <InputLabel value="Nominal (Rp)" />
                            <TextInput type="number" className="w-full mt-1" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="0" required />
                             {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
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
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Transfer ke Kas Kecil</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Pindahkan dana dari Kas Besar ke Kas Kecil. Transaksi ini akan tercatat sebagai pengeluaran di Kas Besar dan pemasukan di Kas Kecil.
                    </p>
                    <form onSubmit={handleTransferSubmit} className="space-y-4">
                        <div>
                            <InputLabel value="Tanggal Transfer" />
                            <TextInput type="date" className="w-full mt-1" value={transferData.transaction_date} onChange={e => setTransferData('transaction_date', e.target.value)} required />
                            {transferErrors.transaction_date && <div className="text-red-500 text-xs mt-1">{transferErrors.transaction_date}</div>}
                        </div>

                        <div>
                            <InputLabel value="Keterangan / Keperluan" />
                            <TextInput type="text" className="w-full mt-1" value={transferData.description} onChange={e => setTransferData('description', e.target.value)} placeholder="Contoh: Tambahan Kas Kecil Minggu Ini" required />
                            {transferErrors.description && <div className="text-red-500 text-xs mt-1">{transferErrors.description}</div>}
                        </div>

                        <div>
                            <InputLabel value="Nominal Transfer (Rp)" />
                            <TextInput type="number" className="w-full mt-1" value={transferData.amount} onChange={e => setTransferData('amount', e.target.value)} placeholder="0" required />
                             {transferErrors.amount && <div className="text-red-500 text-xs mt-1">{transferErrors.amount}</div>}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <SecondaryButton onClick={() => setIsTransferModalOpen(false)} disabled={transferProcessing}>Batal</SecondaryButton>
                            <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700" disabled={transferProcessing}>
                                {transferProcessing ? 'Memproses Transfer...' : 'Lakukan Transfer'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

             {/* Delete Confirmation Modal */}
             <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi?</h2>

                    <p className="text-gray-600 mb-6">
                        Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            {processing ? 'Menghapus...' : 'Hapus Transaksi'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
