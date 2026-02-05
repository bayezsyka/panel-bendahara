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

export default function Index({ grades }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        price: '',
        description: '',
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const openModal = (grade = null) => {
        setEditingGrade(grade);
        setIsModalOpen(true);
        if (grade) {
            setData({
                name: grade.name,
                price: grade.price,
                description: grade.description || '',
            });
        } else {
            reset();
        }
        clearErrors();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGrade(null);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => closeModal();

        if (editingGrade) {
            put(route('receivable.grades.update', editingGrade.id), { onSuccess });
        } else {
            post(route('receivable.grades.store'), { onSuccess });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Mutu?',
            text: "Data ini akan dihapus permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('receivable.grades.destroy', id), {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title="Data Mutu Beton" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Data Mutu Beton</h3>
                            <p className="mt-1 text-sm text-gray-600">Kelola daftar mutu dan standar harga.</p>
                        </div>
                        <PrimaryButton onClick={() => openModal()} className="!bg-indigo-600">
                            + Tambah Mutu Baru
                        </PrimaryButton>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Nama Mutu</th>
                                    <th className="px-6 py-4 text-right">Harga Satuan (Rp)</th>
                                    <th className="px-6 py-4">Deskripsi</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{grade.name}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-700">{formatCurrency(grade.price)}</td>
                                        <td className="px-6 py-4 text-gray-500">{grade.description || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openModal(grade)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                                                <button onClick={() => handleDelete(grade.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {grades.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                                            Belum ada data mutu.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingGrade ? 'Edit Mutu' : 'Tambah Mutu Baru'}
                    </h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Mutu" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="K-225"
                                isFocused
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="price" value="Harga Satuan (Rp)" />
                            <TextInput
                                id="price"
                                type="number"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="mt-1 block w-full text-right"
                                placeholder="0"
                            />
                            <InputError message={errors.price} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi (Opsional)" />
                            <TextInput
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Mutu standar cor jalan"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal} disabled={processing}>Batal</SecondaryButton>
                            <PrimaryButton disabled={processing}>{editingGrade ? 'Simpan Perubahan' : 'Simpan'}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
