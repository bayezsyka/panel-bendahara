import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { SearchInput } from '@/Components/ui';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';

export default function Index({ trucks, filters = {} }) {
    const { auth } = usePage().props;
    const { can_create, can_edit, can_delete } = auth.permissions || {};

    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(
                    route('delivery.trucks.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [truckToDelete, setTruckToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        vehicle_number: '',
        driver_name: '',
        is_active: true,
    });

    const openModal = (truck = null) => {
        if (truck) {
            setEditingTruck(truck);
            setData({
                vehicle_number: truck.vehicle_number,
                driver_name: truck.driver_name || '',
                is_active: truck.is_active,
            });
        } else {
            setEditingTruck(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTruck(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTruck) {
            put(route('delivery.trucks.update', editingTruck.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('delivery.trucks.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (truck) => {
        setTruckToDelete(truck);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (truckToDelete) {
            destroy(route('delivery.trucks.destroy', truckToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setTruckToDelete(null);
                },
            });
        }
    };

    return (
        <BendaharaLayout>
            <Head title="Master Mobil Molen (Truck)" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mobil Molen (Truck)</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola daftar mobil molen dan supir default</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Cari truck..."
                        />
                        {can_create && (
                            <PrimaryButton onClick={() => openModal()}>
                                + Tambah Truck
                            </PrimaryButton>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Polisi</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supir Default</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {trucks.length > 0 ? (
                                trucks.map((truck) => (
                                    <tr key={truck.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{truck.vehicle_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 icon-font">{truck.driver_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${truck.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {truck.is_active ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex justify-center flex-wrap gap-2">
                                                {can_edit && (
                                                    <button onClick={() => openModal(truck)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                                )}
                                                {can_delete && (
                                                    <button onClick={() => confirmDelete(truck)} className="text-red-600 hover:text-red-900 text-sm font-medium">Hapus</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                        Belum ada data truck
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
                        {editingTruck ? 'Edit Truck' : 'Tambah Truck'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="vehicle_number" value="No. Polisi" />
                            <TextInput
                                id="vehicle_number"
                                type="text"
                                className="w-full mt-1"
                                value={data.vehicle_number}
                                onChange={e => setData('vehicle_number', e.target.value)}
                                placeholder="Contoh: B 1234 ABC"
                                required
                            />
                            <InputError message={errors.vehicle_number} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="driver_name" value="Supir Default" />
                            <TextInput
                                id="driver_name"
                                type="text"
                                className="w-full mt-1"
                                value={data.driver_name}
                                onChange={e => setData('driver_name', e.target.value)}
                                placeholder="Nama Supir"
                            />
                            <InputError message={errors.driver_name} className="mt-1" />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                                <span className="text-sm font-medium text-gray-700">Aktif</span>
                            </label>
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
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Truck?</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Apakah Anda yakin ingin menghapus truck ini? Tindakan ini tidak dapat dibatalkan.
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
