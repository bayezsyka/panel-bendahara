import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';

export default function Index({ customers }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        address: '',
        contact: '',
        npwp: '',
    });

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setData({
                name: customer.name,
                address: customer.address || '',
                contact: customer.contact || '',
                npwp: customer.npwp || '',
            });
        } else {
            setEditingCustomer(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            put(route('delivery.customers.update', editingCustomer.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('delivery.customers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = (customer) => {
        setCustomerToDelete(customer);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (customerToDelete) {
            destroy(route('delivery.customers.destroy', customerToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setCustomerToDelete(null);
                },
            });
        }
    };

    return (
        <BendaharaLayout>
            <Head title="Customer Beton" />

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Customer</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Daftar pelanggan aktif pengiriman beton</p>
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
                    >
                        + Tambah Customer
                    </button>
                </div>

                {customers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map((customer) => (
                            <div key={customer.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col">
                                <Link 
                                    href={route('delivery.customers.show', customer.id)}
                                    className="p-6 flex-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-100">
                                            Aktif
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{customer.name}</h3>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="line-clamp-1">{customer.address || 'Alamat tidak tersedia'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            {customer.contact || '-'}
                                        </div>
                                    </div>
                                </Link>
                                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center mt-auto">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        NPWP: {customer.npwp ? 'Tersedia' : 'N/A'}
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => openModal(customer)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider">Edit</button>
                                        <button onClick={() => confirmDelete(customer)} className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider">Hapus</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Belum Ada Customer</h4>
                        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto font-medium">Mulailah dengan menambahkan customer pertama Anda untuk mengelola proyek pengiriman.</p>
                        <button 
                            onClick={() => openModal()}
                            className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                            + Tambah Customer Sekarang
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editingCustomer ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {editingCustomer ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                )}
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                {editingCustomer ? 'Edit Profil' : 'Customer Baru'}
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">Lengkapi informasi dasar pelanggan</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Perusahaan / Customer" className="text-xs font-bold uppercase text-gray-400 tracking-wider" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="w-full mt-2 bg-gray-50 border-gray-200 focus:bg-white transition-all text-sm font-semibold"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Contoh: PT. Maju Jaya"
                                    required
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="address" value="Alamat Kantor" className="text-xs font-bold uppercase text-gray-400 tracking-wider" />
                                <textarea
                                    id="address"
                                    className="w-full mt-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm transition-all text-sm font-semibold"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Alamat lengkap perusahaan"
                                    rows="3"
                                ></textarea>
                                <InputError message={errors.address} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="contact" value="Kontak / HP" className="text-xs font-bold uppercase text-gray-400 tracking-wider" />
                                    <TextInput
                                        id="contact"
                                        type="text"
                                        className="w-full mt-2 bg-gray-50 border-gray-200 focus:bg-white transition-all text-sm font-semibold"
                                        value={data.contact}
                                        onChange={e => setData('contact', e.target.value)}
                                        placeholder="0812xxxxxxxx"
                                    />
                                    <InputError message={errors.contact} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="npwp" value="No. NPWP" className="text-xs font-bold uppercase text-gray-400 tracking-wider" />
                                    <TextInput
                                        id="npwp"
                                        type="text"
                                        className="w-full mt-2 bg-gray-50 border-gray-200 focus:bg-white transition-all text-sm font-semibold"
                                        value={data.npwp}
                                        onChange={e => setData('npwp', e.target.value)}
                                        placeholder="00.000.000.0-000.000"
                                    />
                                    <InputError message={errors.npwp} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-10">
                            <button 
                                type="button"
                                onClick={closeModal} 
                                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-wider"
                                disabled={processing}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                className="px-8 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-xs uppercase tracking-widest disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Menyimpan...' : (editingCustomer ? 'Perbarui Profil' : 'Daftarkan Customer')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Customer?</h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        Apakah Anda yakin ingin menghapus customer ini? Semua data terkait mungkin akan terdampak.
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
