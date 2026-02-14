import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PageHeader from '@/Components/PageHeader';
import { DataTable, Badge, SearchInput } from '@/Components/ui';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Index({ auth, users, filters, offices = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'bendahara',
        office_id: 1,
        is_active: true,
        allowed_panels: [],
    });

    // Debounced search
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
            allowed_panels: user.allowed_panels || [],
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

    const handleDelete = (user) => {
        if (user.id === auth.user.id) {
            Swal.fire({ icon: 'error', title: 'Opps!', text: 'Anda tidak bisa menghapus akun sendiri.' });
            return;
        }
        Swal.fire({
            title: 'Hapus User?',
            text: `Apakah Anda yakin ingin menghapus ${user.name}?`,
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
                        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'User berhasil dihapus.', timer: 1500, showConfirmButton: false });
                    },
                });
            }
        });
    };

    // Table columns
    const columns = [
        {
            key: 'name',
            label: 'Nama',
            render: (row) => (
                <div>
                    <div className="text-sm font-bold text-gray-900">{row.name}</div>
                    <div className="text-xs text-gray-400 font-medium">UID: {row.id}</div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (row) => (
                <span className="text-sm text-gray-600 font-medium">{row.email}</span>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={row.role === 'superadmin' ? 'purple' : 'indigo'} size="md">
                        {row.role}
                    </Badge>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-0.5">
                        {offices.find(o => o.id === row.office_id)?.name || 'N/A'}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge variant={row.is_active ? 'emerald' : 'red'} size="md" dot>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-1">
                    <button
                        onClick={() => openEditModal(row)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit User"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus User"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    // Build mock rows for restricted view
    const mockRows = offices.length === 0
        ? [1, 2, 3, 4, 5].map(i => ({ id: `mock-${i}`, name: '', email: '', role: '', is_active: false }))
        : [];

    return (
        <BendaharaLayout>
            <Head title="Management User" />

            <div className="py-12 relative min-h-[500px]">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 transition-all duration-500">
                    <div className="space-y-6">
                        <PageHeader
                            title="Management User"
                            actions={
                                <PrimaryButton onClick={openCreateModal}>
                                    + Tambah User
                                </PrimaryButton>
                            }
                        />

                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Cari nama atau email..."
                            maxWidth="max-w-sm"
                        />

                        <DataTable
                            columns={columns}
                            data={users.data}
                            emptyMessage="Tidak ada data user."
                            pagination={users.links}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        {isEditMode ? 'Edit User' : 'Tambah User Baru'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput id="name" type="text" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required isFocused />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput id="password" type="password" className="mt-1 block w-full" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder={isEditMode ? 'Isi jika ingin mengubah' : ''} required={!isEditMode} />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Role Selection */}
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

                        {/* Office Selection */}
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

                        {/* Allowed Panels (Bendahara OR Superadmin Plant) */}
                        {(data.role === 'bendahara' || (data.role === 'superadmin' && data.office_id === 2)) && (
                            <div>
                                <InputLabel value="Akses Panel" className="mb-2" />
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'finance', label: 'Finance (Biaya Proyek & Operasional)' },
                                        { id: 'kas', label: 'Cash (Kas Besar & Kecil)' },
                                        { id: 'receivable', label: 'Receivable (Piutang)' },
                                        { id: 'delivery', label: 'Delivery (Pengiriman)' },
                                    ].map((panel) => (
                                        <label key={panel.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                            <Checkbox
                                                name="allowed_panels"
                                                value={panel.id}
                                                checked={data.allowed_panels.includes(panel.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setData('allowed_panels', checked 
                                                        ? [...data.allowed_panels, panel.id]
                                                        : data.allowed_panels.filter(p => p !== panel.id)
                                                    );
                                                }}
                                            />
                                            <span className="text-gray-700 text-sm font-medium">{panel.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.allowed_panels} className="mt-2" />
                            </div>
                        )}

                        {/* Status Toggle */}
                        <div className="flex items-center space-x-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={data.is_active} 
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">Status Aktif</span>
                            </label>
                        </div>
                        <InputError message={errors.is_active} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} disabled={processing}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : (isEditMode ? 'Simpan Data' : 'Buat User')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </BendaharaLayout>
    );
}
