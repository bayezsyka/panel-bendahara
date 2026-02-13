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
import { SearchInput, Badge, EmptyState, Card } from '@/Components/ui';
import Swal from 'sweetalert2';

export default function Index({ mandors }) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('');
    
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        name: '',
    });

    const filteredMandors = mandors.filter(mandor => 
        mandor.name.toLowerCase().includes(search.toLowerCase())
    );

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

            <div className="space-y-6">
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

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Cari pelaksana..."
                />

                {filteredMandors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredMandors.map((mandor) => (
                            <Card key={mandor.id} noPadding hover>
                                {/* Card Content (Clickable) */}
                                <Link href={route('projectexpense.mandors.show', mandor.id)} className="block p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 h-11 w-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-base">
                                            {mandor.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-indigo-600 transition">
                                                {mandor.name}
                                            </h3>

                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Memegang</span>
                                        <Badge variant={mandor.projects_count > 0 ? 'indigo' : 'gray'} size="md">
                                            {mandor.projects_count} Proyek
                                        </Badge>
                                    </div>
                                </Link>

                                {/* Actions Footer */}
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                    <button 
                                        onClick={() => openEditModal(mandor)}
                                        className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                                    >
                                        Edit Data
                                    </button>
                                    <div className="text-gray-200">|</div>
                                    <button 
                                        onClick={() => handleDelete(mandor.id)}
                                        className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <EmptyState
                            title="Tidak ada data pelaksana"
                            description="Tidak ada pelaksana yang cocok dengan pencarian Anda."
                            icon={
                                <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                        />
                    </Card>
                )}
            </div>

            {/* Modal Create/Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        {isEditing ? 'Edit Data Pelaksana' : 'Tambah Pelaksana Baru'}
                    </h2>

                    <div className="space-y-4">
                        <div>
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