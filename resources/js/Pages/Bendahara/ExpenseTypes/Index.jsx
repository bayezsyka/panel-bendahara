import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import PageHeader from '@/Components/PageHeader';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function Index({ expenseTypes, currentOfficeId }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const isPlant = currentOfficeId === 2;

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        name: '',
        code: '',
        category: 'out',
    });

    const openAddModal = () => {
        setIsEditing(false);
        reset();
        setData('category', 'out'); // Default
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (expenseType) => {
        setIsEditing(true);
        setData({
            id: expenseType.id,
            name: expenseType.name,
            code: expenseType.code || '',
            category: expenseType.category || 'out',
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('bendahara.expense-types.update', data.id), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        } else {
            post(route('bendahara.expense-types.store'), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Tipe?',
            text: 'Data tipe ini akan dihapus. Pastikan tidak sedang digunakan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('bendahara.expense-types.destroy', id));
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title={isPlant ? "Kelola Tipe" : "Kelola Tipe Biaya"} />

            <PageHeader
                title={isPlant ? "Data Tipe" : "Data Tipe Biaya"}
                backLink={route('bendahara.dashboard')}
                backLabel="Dashboard"
                actions={
                    <PrimaryButton onClick={openAddModal}>
                        {isPlant ? "+ Tambah Tipe" : "+ Tambah Tipe Biaya"}
                    </PrimaryButton>
                }
            />

            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isPlant ? "Nama Tipe" : "Nama Tipe Biaya"}</th>
                                {isPlant && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {expenseTypes.length > 0 ? (
                                expenseTypes.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {type.name}
                                        </td>
                                        {isPlant && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {type.category === 'in' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Pemasukan
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Pengeluaran
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openEditModal(type)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(type.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isPlant ? 3 : 2} className="px-6 py-12 text-center text-gray-500">
                                        Belum ada data tipe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Create/Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? (isPlant ? 'Edit Tipe' : 'Edit Tipe Biaya') : (isPlant ? 'Tambah Tipe Baru' : 'Tambah Tipe Biaya Baru')}
                    </h2>
                    {isPlant && (
                        <div className="mb-4">
                            <InputLabel value="Kategori Transaksi" />
                            <select
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                            >
                                <option value="out">Pengeluaran (Kas Keluar)</option>
                                <option value="in">Pemasukan (Kas Masuk)</option>
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>
                    )}

                    <div className="mb-6">
                        <InputLabel value={isPlant ? "Nama Tipe" : "Nama Tipe Biaya"} />
                        <TextInput
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder={isPlant ? "Contoh: Material, BBM, Upah, Penjualan Scrap" : "Contoh: Gaji, Listrik, Material Project"}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </BendaharaLayout>
    );
}
