import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ sources }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const openModal = (source = null) => {
        if (source) {
            setEditingSource(source);
            setData({
                name: source.name,
                description: source.description || '',
            });
        } else {
            setEditingSource(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSource(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSource) {
            put(route('kas.sources.update', editingSource.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('kas.sources.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (source) => {
        setSourceToDelete(source);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (sourceToDelete) {
            destroy(route('kas.sources.destroy', sourceToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSourceToDelete(null);
                },
                onError: (err) => {
                    setIsDeleteModalOpen(false);
                    // Error usually handled by session or flash message but here it's fine
                }
            });
        }
    };

    return (
        <BendaharaLayout>
            <Head title="Master Sumber Dana" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sumber Dana</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola sumber pemasukan untuk Kas Besar</p>
                    </div>
                    <PrimaryButton onClick={() => openModal()}>
                        + Tambah Sumber
                    </PrimaryButton>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Sumber</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sources.length > 0 ? (
                                sources.map((source) => (
                                    <tr key={source.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{source.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{source.description || '-'}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button onClick={() => openModal(source)} className="text-indigo-600 hover:text-indigo-900 mx-2 text-sm font-medium">Edit</button>
                                            <button onClick={() => confirmDelete(source)} className="text-red-600 hover:text-red-900 mx-2 text-sm font-medium">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 italic">
                                        Belum ada data sumber dana
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
                        {editingSource ? 'Edit Sumber Dana' : 'Tambah Sumber Dana'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Sumber Dana" />
                            <TextInput
                                id="name"
                                type="text"
                                className="w-full mt-1"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Contoh: Deposit Bank, Modal Awal, dll"
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
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Sumber Dana?</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Apakah Anda yakin ingin menghapus sumber dana ini? Tindakan ini tidak dapat dibatalkan.
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
