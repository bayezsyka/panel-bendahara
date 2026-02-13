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
import { DataTable } from '@/Components/ui';
import Swal from 'sweetalert2';

export default function Index({ benderas }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        name: '',
        code: '',
    });

    const openAddModal = () => {
        setIsEditing(false);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (bendera) => {
        setIsEditing(true);
        setData({
            id: bendera.id,
            name: bendera.name,
            code: bendera.code || '',
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('projectexpense.benderas.update', data.id), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        } else {
            post(route('projectexpense.benderas.store'), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Bendera?',
            text: 'Data bendera ini akan dihapus permanen.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('projectexpense.benderas.destroy', id));
            }
        });
    };

    const columns = [
        {
            key: 'name',
            label: 'Nama Bendera (PT/CV)',
            render: (row) => (
                <span className="font-medium text-gray-900">{row.name}</span>
            ),
        },
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
            <Head title="Kelola Bendera" />

            <div className="space-y-6">
                <PageHeader
                    title="Data Bendera"
                    backLink={route('projectexpense.overview')}
                    backLabel="Dashboard"
                    actions={
                        <PrimaryButton onClick={openAddModal}>
                            + Tambah Bendera
                        </PrimaryButton>
                    }
                />

                <DataTable
                    columns={columns}
                    data={benderas}
                    emptyMessage="Belum ada data bendera."
                />
            </div>

            {/* Modal Create/Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        {isEditing ? 'Edit Data Bendera' : 'Tambah Bendera Baru'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Nama Bendera / Perusahaan" />
                            <TextInput
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Contoh: PT. Jasa Konstruksi Karya"
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
