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
import { DataTable, Badge, Select } from '@/Components/ui';
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
        setData('category', 'out');
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
            put(route('projectexpense.expense-types.update', data.id), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        } else {
            post(route('projectexpense.expense-types.store'), {
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
                destroy(route('projectexpense.expense-types.destroy', id));
            }
        });
    };

    const columns = [
        {
            key: 'name',
            label: isPlant ? 'Nama Tipe' : 'Nama Tipe Biaya',
            render: (row) => (
                <span className="font-medium text-gray-900">{row.name}</span>
            ),
        },
        ...(isPlant ? [{
            key: 'category',
            label: 'Kategori',
            render: (row) => (
                <Badge variant={row.category === 'in' ? 'green' : 'red'} size="md">
                    {row.category === 'in' ? 'Pemasukan' : 'Pengeluaran'}
                </Badge>
            ),
        }] : []),
        {
            key: 'actions',
            label: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-1">
                    <button 
                        onClick={() => openEditModal(row)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                    >
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
            <Head title={isPlant ? "Kelola Tipe" : "Kelola Tipe Biaya"} />

            <div className="space-y-6">
                <PageHeader
                    title={isPlant ? "Data Tipe" : "Data Tipe Biaya"}
                    backLink={route('projectexpense.overview')}
                    backLabel="Dashboard"
                    actions={
                        <PrimaryButton onClick={openAddModal}>
                            {isPlant ? "+ Tambah Tipe" : "+ Tambah Tipe Biaya"}
                        </PrimaryButton>
                    }
                />

                <DataTable
                    columns={columns}
                    data={expenseTypes}
                    emptyMessage="Belum ada data tipe."
                />
            </div>

            {/* Modal Create/Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        {isEditing ? (isPlant ? 'Edit Tipe' : 'Edit Tipe Biaya') : (isPlant ? 'Tambah Tipe Baru' : 'Tambah Tipe Biaya Baru')}
                    </h2>

                    <div className="space-y-4">
                        {isPlant && (
                            <div>
                                <InputLabel value="Kategori Transaksi" />
                                <Select
                                    className="mt-1"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    placeholder=""
                                    options={[
                                        { value: 'out', label: 'Pengeluaran (Kas Keluar)' },
                                        { value: 'in', label: 'Pemasukan (Kas Masuk)' },
                                    ]}
                                />
                                <InputError message={errors.category} className="mt-2" />
                            </div>
                        )}

                        <div>
                            <InputLabel value={isPlant ? "Nama Tipe" : "Nama Tipe Biaya"} />
                            <TextInput
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder={isPlant ? "Contoh: Material, BBM, Upah" : "Contoh: Gaji, Listrik, Material"}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
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
