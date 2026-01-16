import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Index({ mandors }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        name: '',
        whatsapp_number: '',
    });

    // Buka Modal Tambah
    const openAddModal = () => {
        setIsEditing(false);
        reset();
        clearErrors();
        setShowModal(true);
    };

    // Buka Modal Edit
    const openEditModal = (mandor) => {
        setIsEditing(true);
        setData({
            id: mandor.id,
            name: mandor.name,
            whatsapp_number: mandor.whatsapp_number,
        });
        clearErrors();
        setShowModal(true);
    };

    // Handle Submit (Create/Update)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('bendahara.mandors.update', data.id), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        } else {
            post(route('bendahara.mandors.store'), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    // Handle Delete
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus mandor ini?')) {
            destroy(route('bendahara.mandors.destroy', id));
        }
    };

    return (
        <BendaharaLayout>
            <Head title="Kelola Mandor" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Daftar Mandor</h1>
                <PrimaryButton onClick={openAddModal}>
                    + Tambah Mandor
                </PrimaryButton>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mandor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek Aktif</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mandors.length > 0 ? (
                                mandors.map((mandor) => (
                                    <tr key={mandor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {mandor.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <a 
                                                href={`https://wa.me/${mandor.whatsapp_number}`} 
                                                target="_blank" 
                                                className="text-green-600 hover:underline flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                                {mandor.whatsapp_number}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            {mandor.projects_count > 0 ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                                    {mandor.projects_count} Proyek
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openEditModal(mandor)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(mandor.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        Belum ada data mandor.
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
                        {isEditing ? 'Edit Data Mandor' : 'Tambah Mandor Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Nama Lengkap" />
                        <TextInput
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: Pak Budi"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Nomor WhatsApp" />
                        <TextInput
                            value={data.whatsapp_number}
                            onChange={e => setData('whatsapp_number', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: 081234567890"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Gunakan format 08xxx atau 628xxx</p>
                        <InputError message={errors.whatsapp_number} className="mt-2" />
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