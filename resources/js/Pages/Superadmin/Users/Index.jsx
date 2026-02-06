import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton'; // Typically used for delete, but good to have
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Index({ auth, users, filters, offices = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Form handling
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'bendahara',
        office_id: 1,
        is_active: true,
    });

    // Handle Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(
                    route('superadmin.users.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingUser(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditMode(true);
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '', 
            role: user.role,
            office_id: user.office_id,
            is_active: Boolean(user.is_active),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('superadmin.users.update', editingUser.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('superadmin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleActive = (val) => {
        setData('is_active', val);
    };

    const handleDelete = (user) => {
        if (user.id === auth.user.id) {
            Swal.fire({
                icon: 'error',
                title: 'Opps!',
                text: 'Anda tidak bisa menghapus akun sendiri.',
            });
            return;
        }

        Swal.fire({
            title: 'Hapus User?',
            text: `Apakah Anda yakin ingin menghapus ${user.name}? Semua aktivitas log tetap tersimpan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('superadmin.users.destroy', user.id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Terhapus!',
                            text: 'User telah berhasil dihapus.',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    return (
        <BendaharaLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Management User</h2>}
        >
            <Head title="Management User" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Top Bar: Search & Create */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <div className="w-full sm:w-1/3">
                                <TextInput
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    className="w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <PrimaryButton onClick={openCreateModal}>
                                + Tambah User
                            </PrimaryButton>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-400 font-medium">UID: {user.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg w-fit ${
                                                            user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 
                                                            'bg-indigo-100 text-indigo-700'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                                                            {offices.find(o => o.id === user.office_id)?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase tracking-wider rounded-lg ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="Edit User"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="Hapus User"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                Tidak ada data user.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-between items-center">
                             <div>
                                {/* Simple info or blank */}
                             </div>
                             <div className="flex gap-2">
                                {users.links.map((link, index) => (
                                    <div key={index}>
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                className={`px-3 py-1 border rounded text-sm ${link.active ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 bg-gray-100 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditMode ? 'Edit User' : 'Tambah User Baru'}
                    </h2>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={isEditMode ? 'Isi jika ingin mengubah' : ''}
                                required={!isEditMode}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Role Selection - Premium Cards */}
                        <div>
                            <InputLabel value="Pilih Role Akses" className="mb-2" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { id: 'superadmin', name: 'Superadmin', desc: 'Akses penuh seluruh kantor & switcher', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.499V21.5a11.955 11.955 0 01-8.618-3.04' },
                                    { id: 'bendahara', name: 'Bendahara', desc: 'Akses modul Finance & Piutang', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setData('role', role.id)}
                                        className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all ${
                                            data.role === role.id 
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                                                : 'border-gray-100 hover:border-indigo-200 bg-white'
                                        }`}
                                    >
                                        <div className={`p-1.5 rounded-lg w-fit mb-2 ${data.role === role.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={role.icon} />
                                            </svg>
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${data.role === role.id ? 'text-indigo-700' : 'text-gray-900'}`}>
                                            {role.name}
                                        </span>
                                        <p className="text-[10px] text-gray-400 mt-1 leading-tight font-medium">{role.desc}</p>
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        {/* Office Selection - Segmented Style */}
                        <div>
                            <InputLabel value="Penempatan Kantor" className="mb-2" />
                            <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                                {offices.map((office) => (
                                    <button
                                        key={office.id}
                                        type="button"
                                        onClick={() => setData('office_id', office.id)}
                                        className={`flex-1 py-2 text-center rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                            data.office_id === office.id 
                                                ? 'bg-white text-indigo-600 shadow-sm' 
                                                : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {office.name}
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.office_id} className="mt-2" />
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center space-x-2">
                           <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={data.is_active} 
                                    onChange={(e) => toggleActive(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">Status Aktif</span>
                            </label>
                        </div>
                        <InputError message={errors.is_active} className="mt-2" />

                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton onClick={closeModal} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : (isEditMode ? 'Simpan Data' : 'Buat User')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

        </BendaharaLayout>
    );
}
