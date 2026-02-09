import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ types }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const openModal = (type = null) => {
        if (type) {
            setEditingType(type);
            setData({
                name: type.name,
                description: type.description || '',
            });
        } else {
            setEditingType(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingType(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingType) {
            put(route('kas.expense-types.update', editingType.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('kas.expense-types.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (type) => {
        setTypeToDelete(type);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (typeToDelete) {
            destroy(route('kas.expense-types.destroy', typeToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setTypeToDelete(null);
                },
                onError: (err) => {
                    setIsDeleteModalOpen(false);
                }
            });
        }
    };

    return (
        <BendaharaLayout>
            <Head title="Master Tipe Biaya Kas" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Tipe Biaya Kas</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola tipe pengeluaran untuk Kas Besar & Kecil</p>
                    </div>
                    <PrimaryButton onClick={() => openModal()}>
                        + Tambah Tipe Biaya
                    </PrimaryButton>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Tipe</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {types.length > 0 ? (
                                types.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{type.description || '-'}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button onClick={() => openModal(type)} className="text-indigo-600 hover:text-indigo-900 mx-2 text-sm font-medium">Edit</button>
                                            <button onClick={() => confirmDelete(type)} className="text-red-600 hover:text-red-900 mx-2 text-sm font-medium">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 italic">
                                        Belum ada data tipe biaya
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {editingType ? 'Edit Tipe Biaya Kas' : 'Tambah Tipe Biaya Kas'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Tipe Biaya" />
                            <TextInput
                                id="name"
                                type="text"
                                className="w-full mt-1"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Contoh: ATK, Konsumsi, Transport, dll"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Keterangan" />
                            <TextInput
                                id="description"
                                type="text"
                                className="w-full mt-1"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Opsional"
                            />
                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <SecondaryButton onClick={closeModal} disabled={processing}>Batal</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Tipe Biaya Kas?</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Apakah Anda yakin ingin menghapus tipe biaya ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    {errors.error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100">{errors.error}</div>}
                    <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            {processing ? 'Menghapus...' : 'Hapus'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
