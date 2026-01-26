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
            put(route('bendahara.benderas.update', data.id), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        } else {
            post(route('bendahara.benderas.store'), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Bendera?',
            text: 'Data bendera ini akan dihapus permanen. Pastikan tidak ada proyek yang menggunakan bendera ini (validasi sistem mungkin akan menolak jika ada).',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('bendahara.benderas.destroy', id));
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title="Kelola Bendera" />

            <PageHeader
                title="Data Bendera"
                backLink={route('bendahara.dashboard')}
                backLabel="Dashboard"
                actions={
                    <PrimaryButton onClick={openAddModal}>
                        + Tambah Bendera
                    </PrimaryButton>
                }
            />

            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Bendera (PT/CV)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode / Singkatan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {benderas.length > 0 ? (
                                benderas.map((bendera) => (
                                    <tr key={bendera.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {bendera.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {bendera.code || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openEditModal(bendera)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(bendera.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                        Belum ada data bendera.
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
                        {isEditing ? 'Edit Data Bendera' : 'Tambah Bendera Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Nama Bendera / Perusahaan" />
                        <TextInput
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: PT. Jasa Konstruksi Karya atau JKK Langsung"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Kode (Opsional)" />
                        <TextInput
                            value={data.code}
                            onChange={e => setData('code', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: JKK, EKA, dll. Untuk keperluan laporan."
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </BendaharaLayout>
    );
}
