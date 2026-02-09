import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';

export default function Index({ concreteGrades }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [gradeToDelete, setGradeToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        code: '',
        price: '',
        description: '',
    });

    const openModal = (grade = null) => {
        if (grade) {
            setEditingGrade(grade);
            setData({
                code: grade.code,
                price: grade.price,
                description: grade.description || '',
            });
        } else {
            setEditingGrade(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGrade(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingGrade) {
            put(route('delivery.concrete-grades.update', editingGrade.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('delivery.concrete-grades.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (grade) => {
        setGradeToDelete(grade);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (gradeToDelete) {
            destroy(route('delivery.concrete-grades.destroy', gradeToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setGradeToDelete(null);
                },
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <BendaharaLayout>
            <Head title="Master Mutu Beton" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mutu Beton</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola daftar mutu beton dan harga default</p>
                    </div>
                    <PrimaryButton onClick={() => openModal()}>
                        + Tambah Mutu
                    </PrimaryButton>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Mutu</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga Default</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {concreteGrades.length > 0 ? (
                                concreteGrades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{grade.code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(grade.price)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{grade.description || '-'}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button onClick={() => openModal(grade)} className="text-indigo-600 hover:text-indigo-900 mx-2 text-sm font-medium">Edit</button>
                                            <button onClick={() => confirmDelete(grade)} className="text-red-600 hover:text-red-900 mx-2 text-sm font-medium">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                        Belum ada data mutu beton
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
                        {editingGrade ? 'Edit Mutu Beton' : 'Tambah Mutu Beton'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="code" value="Kode Mutu" />
                            <TextInput
                                id="code"
                                type="text"
                                className="w-full mt-1"
                                value={data.code}
                                onChange={e => setData('code', e.target.value)}
                                placeholder="Contoh: K-225, K-300"
                                required
                            />
                            <InputError message={errors.code} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="price" value="Harga Default (Template)" />
                            <TextInput
                                id="price"
                                type="number"
                                className="w-full mt-1"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                placeholder="0"
                                required
                            />
                            <InputError message={errors.price} className="mt-1" />
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
                            <InputError message={errors.description} className="mt-1" />
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
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Mutu Beton?</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Apakah Anda yakin ingin menghapus mutu beton ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
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
