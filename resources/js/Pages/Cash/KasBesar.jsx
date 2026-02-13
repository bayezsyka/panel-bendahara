import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PageHeader from '@/Components/PageHeader';
import { DataTable, Badge, StatCard, Select, Card } from '@/Components/ui';

export default function KasBesar({ transactions, cashSources, cashExpenseTypes, totalIn, totalOut, balance, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('in');
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

    // Table columns
    const columns = [
        {
            key: 'date',
            label: 'Tanggal',
            render: (row) => (
                <span className="text-gray-600 whitespace-nowrap">{formatDate(row.transaction_date)}</span>
            ),
        },
        {
            key: 'category',
            label: 'Kategori/Tipe',
            render: (row) => (
                <div>
                    <Badge variant={row.type === 'in' ? 'emerald' : 'red'} size="md">
                        {row.type === 'in' ? 'Masuk' : 'Keluar'}
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">
                        {row.type === 'in' ? (row.cash_source?.name || 'Sumber Lain') : (row.cash_expense_type?.name || 'Biaya Lain')}
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            label: 'Keterangan',
            render: (row) => (
                <span className="text-gray-800 font-medium">{row.description}</span>
            ),
        },
        {
            key: 'amount',
            label: 'Nominal',
            align: 'right',
            render: (row) => (
                <span className={`font-bold whitespace-nowrap ${row.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.type === 'in' ? '+' : '-'}{formatRupiah(row.amount)}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            align: 'center',
            render: (row) => (
                <div className="flex justify-center gap-1">
                    <button onClick={() => openModal(row.type, row)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button onClick={() => confirmDelete(row)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <BendaharaLayout>
            <Head title="Kas Besar" />

            <div className="space-y-6">
                {/* Header & Balance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <PageHeader
                            title="Kas Besar"
                            subtitle="Kelola pemasukan dan pengeluaran kas besar."
                            backLink={route('kas.dashboard')}
                            backLabel="Dashboard Kas"
                        />
                    </div>

                    {/* Balance Card */}
                    <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Saldo Saat Ini</p>
                            <h3 className="text-3xl font-bold">{formatRupiah(balance)}</h3>
                        </div>
                    </div>
                </div>

                {/* Actions & Summary */}
                <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-3 overflow-x-auto pb-1 sm:pb-0">
                        <PrimaryButton onClick={() => openModal('in')} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 whitespace-nowrap">
                            + Pemasukan
                        </PrimaryButton>
                        <PrimaryButton onClick={() => openModal('out')} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 whitespace-nowrap">
                            - Pengeluaran
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setIsTransferModalOpen(true)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 whitespace-nowrap">
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
                </Card>

                {/* Transactions Table */}
                <DataTable
                    columns={columns}
                    data={transactions || []}
                    emptyMessage="Belum ada transaksi"
                />
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
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
                            <InputLabel value="Keterangan" />
                            <TextInput type="text" className="w-full mt-1" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Contoh: Deposit dari Bank" required />
                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                        </div>

                        <div>
                            <InputLabel value="Nominal (Rp)" />
                            <TextInput type="number" className="w-full mt-1" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="0" required />
                            {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
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
        </BendaharaLayout>
    );
}
