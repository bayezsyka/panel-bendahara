import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function KasBesar({ transactions, expenseTypes, totalIn, totalOut, balance, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const { data, setData, post, put, processing, errors, reset } = useForm({
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'in',
        cash_type: 'kas_besar',
        expense_type_id: ''
    });

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('bendahara.plant-transactions.update', editingId), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingId(null);
                    reset();
                    Swal.fire('Berhasil', 'Transaksi berhasil diperbarui', 'success');
                }
            });
        } else {
            post(route('bendahara.plant-transactions.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    Swal.fire('Berhasil', 'Transaksi berhasil dicatat', 'success');
                }
            });
        }
    };

    const handleEdit = (trx) => {
        setEditingId(trx.id);
        setData({
            transaction_date: trx.transaction_date.split('T')[0],
            description: trx.description,
            amount: trx.amount,
            type: trx.type,
            cash_type: 'kas_besar',
            expense_type_id: trx.expense_type_id || ''
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('bendahara.plant-transactions.destroy', id), {
                    onSuccess: () => Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success')
                });
            }
        });
    };

    const openNewModal = (type = 'in') => {
        setEditingId(null);
        reset();
        setData({
            transaction_date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '',
            type: type,
            cash_type: 'kas_besar',
            expense_type_id: ''
        });
        setShowModal(true);
    };

    const handleFilter = (key, value) => {
        router.get(route('bendahara.plant.kas-besar'), {
            ...filters,
            [key]: value || undefined
        }, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        router.get(route('bendahara.plant.kas-besar'), {}, {
            preserveState: true,
            replace: true
        });
    };

    const hasActiveFilters = filters.type || filters.expense_type_id;

    return (
        <BendaharaLayout>
            <Head title="Kas Besar" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Kas Besar</h2>
                        <p className="text-sm text-gray-500 mt-1">Pencatatan arus kas besar kantor plant</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => openNewModal('in')}
                            className="inline-flex items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Kas Masuk
                        </button>
                        <button
                            onClick={() => openNewModal('out')}
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                            Kas Keluar
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Total Kas Masuk</div>
                                <div className="text-lg font-bold text-emerald-600">{formatRupiah(totalIn)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Total Kas Keluar</div>
                                <div className="text-lg font-bold text-red-600">{formatRupiah(totalOut)}</div>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-50 to-white border-blue-100' : 'from-orange-50 to-white border-orange-100'} rounded-xl border p-5 shadow-sm`}>
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                                <svg className={`h-5 w-5 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Saldo</div>
                                <div className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatRupiah(balance)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Filter:</label>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => handleFilter('type', e.target.value)}
                                className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua Transaksi</option>
                                <option value="in">Kas Masuk</option>
                                <option value="out">Kas Keluar</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Kategori:</label>
                            <select
                                value={filters.expense_type_id || ''}
                                onChange={(e) => handleFilter('expense_type_id', e.target.value)}
                                className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua</option>
                                {expenseTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-12">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Keterangan</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Kategori</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-emerald-600 uppercase tracking-wider">Kas Masuk</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-red-600 uppercase tracking-wider">Kas Keluar</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {transactions.length > 0 ? (
                                    transactions.map((trx, index) => (
                                        <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(trx.transaction_date)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{trx.description}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {trx.expense_type ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {trx.expense_type.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">
                                                {trx.type === 'in' ? formatRupiah(trx.amount) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                                {trx.type === 'out' ? formatRupiah(trx.amount) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(trx)}
                                                        className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(trx.id)}
                                                        className="text-red-600 hover:text-red-900 text-xs font-medium"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Belum ada transaksi. Klik tombol di atas untuk menambah.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Add/Edit */}
            <Modal show={showModal} onClose={() => { setShowModal(false); setEditingId(null); reset(); }}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingId ? 'Edit Transaksi' : (data.type === 'in' ? 'Input Kas Masuk' : 'Input Kas Keluar')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">


                        <div>
                            <InputLabel htmlFor="date" value="Tanggal Transaksi" />
                            <TextInput
                                id="date"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                                required
                            />
                            <InputError message={errors.transaction_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Keterangan" />
                            <TextInput
                                id="description"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Contoh: Transfer dari Pusat / Pembelian Material"
                                required
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="expense_type" value={data.type === 'in' ? "Sumber Dana" : "Tipe"} />
                            <select
                                id="expense_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.expense_type_id}
                                onChange={(e) => setData('expense_type_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih {data.type === 'in' ? "Sumber Dana" : "Tipe"} --</option>
                                {expenseTypes
                                    .filter(type => type.category === data.type)
                                    .map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))
                                }
                            </select>
                            <InputError message={errors.expense_type_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="amount" value="Jumlah (Rp)" />
                            <TextInput
                                id="amount"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="0"
                                required
                            />
                            <InputError message={errors.amount} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => { setShowModal(false); setEditingId(null); reset(); }}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
