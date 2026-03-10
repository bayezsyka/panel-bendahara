import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { SearchInput } from '@/Components/ui';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
export default function Index({ vehicles, filters = {} }) {
    const { auth } = usePage().props;
    const { can_create, can_edit, can_delete } = auth.permissions || {};

    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(
                    route('delivery.vehicles.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        vehicle_number: '',
        driver_name: '',
        is_active: true,
    });

    const openModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setData({
                vehicle_number: vehicle.vehicle_number,
                driver_name: vehicle.driver_name || '',
                is_active: vehicle.is_active,
            });
        } else {
            setEditingVehicle(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingVehicle) {
            put(route('delivery.vehicles.update', editingVehicle.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('delivery.vehicles.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (vehicle) => {
        setVehicleToDelete(vehicle);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (vehicleToDelete) {
            destroy(route('delivery.vehicles.destroy', vehicleToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setVehicleToDelete(null);
                },
            });
        }
    };

    return (
        <BendaharaLayout>
            <Head title="Master Armada" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Master Armada</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola daftar kendaraan dan sopir pengiriman</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Cari nopol atau nama sopir..."
                        />
                        {can_create && (
                            <PrimaryButton onClick={() => openModal()}>
                                + Tambah Armada
                            </PrimaryButton>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Polisi</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Sopir</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vehicles.data && vehicles.data.length > 0 ? (
                                vehicles.data.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.vehicle_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{vehicle.driver_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {vehicle.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex justify-center">
                                                {can_edit && (
                                                    <button onClick={() => openModal(vehicle)} className="text-indigo-600 hover:text-indigo-900 mx-2 text-sm font-medium">Edit</button>
                                                )}
                                                {can_delete && (
                                                    <button onClick={() => confirmDelete(vehicle)} className="text-red-600 hover:text-red-900 mx-2 text-sm font-medium">Hapus</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                        Belum ada data armada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {vehicles.links && vehicles.links.length > 3 && (
                    <div className="p-6 border-t border-gray-100 flex justify-center gap-1">
                        {vehicles.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {editingVehicle ? 'Edit Armada' : 'Tambah Armada'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="vehicle_number" value="Nomor Polisi" />
                            <TextInput
                                id="vehicle_number"
                                type="text"
                                className="w-full mt-1 uppercase"
                                value={data.vehicle_number}
                                onChange={e => setData('vehicle_number', e.target.value.toUpperCase())}
                                placeholder="Contoh: G 1234 AB"
                                required
                            />
                            <InputError message={errors.vehicle_number} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="driver_name" value="Nama Sopir (Opsional)" />
                            <TextInput
                                id="driver_name"
                                type="text"
                                className="w-full mt-1"
                                value={data.driver_name}
                                onChange={e => setData('driver_name', e.target.value)}
                                placeholder="Nama Sopir"
                            />
                            <InputError message={errors.driver_name} className="mt-1" />
                        </div>

                        <div className="flex items-center mt-4">
                            <input
                                id="is_active"
                                type="checkbox"
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                Status Kendaraan Aktif
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <SecondaryButton type="button" onClick={closeModal} disabled={processing}>Batal</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Armada?</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Apakah Anda yakin ingin menghapus armada ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={() => setIsDeleteModalOpen(false)}>Batal</SecondaryButton>
                        <DangerButton type="button" onClick={handleDelete} disabled={processing}>
                            {processing ? 'Menghapus...' : 'Hapus'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
