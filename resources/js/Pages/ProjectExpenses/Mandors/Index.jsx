import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import PageHeader from '@/Components/PageHeader';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function Index({ mandors }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('')
    
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        name: '',
        whatsapp_number: '',
    });

    const filteredMandors = mandors.filter(mandor => 
        mandor.name.toLowerCase().includes(search.toLowerCase()) ||
        mandor.whatsapp_number.includes(search)
    )

    const openAddModal = () => {
        setIsEditing(false);
        reset();
        clearErrors();
        setShowModal(true);
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('projectexpense.mandors.update', data.id), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        } else {
            post(route('projectexpense.mandors.store'), {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Pelaksana?',
            text: 'Data pelaksana ini akan dihapus permanen.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('projectexpense.mandors.destroy', id));
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title="Kelola Pelaksana" />

            <PageHeader
                title="Data Pelaksana"
                backLink={route('projectexpense.overview')}
                backLabel="Dashboard"
                actions={
                    <PrimaryButton onClick={openAddModal}>
                        + Tambah Pelaksana
                    </PrimaryButton>
                }
            />

             {/* Search Bar */}
             <div className="relative max-w-md mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                    placeholder="Cari pelaksana..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMandors.length > 0 ? (
                    filteredMandors.map((mandor) => (
                         <div key={mandor.id} className="group flex flex-col bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition duration-200 overflow-hidden relative">
                            {/* Card Content (Clickable) */}
                            <Link href={route('projectexpense.mandors.show', mandor.id)} className="flex-1 p-5 block">
                                <div className="flex items-start gap-4">
                                     <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                        {mandor.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                         <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition">
                                            {mandor.name}
                                        </h3>
                                         <a 
                                            href={`https://wa.me/${mandor.whatsapp_number}`} 
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()} 
                                            className="text-sm text-gray-500 flex items-center gap-1 hover:text-green-600 hover:underline mt-1"
                                        >
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                            {mandor.whatsapp_number}
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Memegang
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        mandor.projects_count > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {mandor.projects_count} Proyek
                                    </span>
                                </div>
                            </Link>

                             {/* Actions Footer */}
                             <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                <button 
                                    onClick={() => openEditModal(mandor)}
                                    className="text-gray-600 hover:text-indigo-600 font-medium"
                                >
                                    Edit Data
                                </button>
                                <div className="text-gray-300">|</div>
                                <button 
                                    onClick={() => handleDelete(mandor.id)}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                >
                                    Hapus
                                </button>
                             </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                         <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Tidak ada data pelaksana yang cocok.</p>
                    </div>
                )}
            </div>

            {/* Modal Create/Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Edit Data Pelaksana' : 'Tambah Pelaksana Baru'}
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
                        <InputError message={errors.whatsapp_number} className="mt-2" />
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