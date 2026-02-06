import React, { useState, useEffect } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import debounce from 'lodash/debounce';

export default function Index({ customers = [], filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        address: '',
        contact: '',
        description: '',
    });

    // Search & Filter State
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [sortBy, setSortBy] = useState(typeof filters?.sort === 'string' ? filters.sort : 'updated_at');

    // Debounced Search Handler
    const performSearch = React.useCallback(
        debounce((query, currentStatus, currentSort) => {
            router.get(
                route('receivable.customers.index'),
                { search: query, status: currentStatus, sort: currentSort },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const onSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        performSearch(val, status, sortBy);
    };

    const handleFilterChange = (newStatus) => {
        setStatus(newStatus);
        router.get(
            route('receivable.customers.index'),
            { search, status: newStatus, sort: sortBy },
            { preserveState: true, replace: true }
        );
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        router.get(
            route('receivable.customers.index'),
            { search, status, sort: newSort },
            { preserveState: true, replace: true }
        );
    };

    const handleResetAll = () => {
         Swal.fire({
            title: 'RESET DATA PIUTANG?',
            text: "PERINGATAN: Ini akan menghapus SEMUA data Customer dan Transaksi Piutang. ID akan di-reset dari awal. Data tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'YA, RESET SEMUA!',
            cancelButtonText: 'Batal',
            focusCancel: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('receivable.customers.reset-all'));
            }
        });
    }

    const formatCurrency = (amount) => {
        if (amount < 0) {
            return `(${new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(Math.abs(amount))})`;
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const openModal = () => {
        setIsModalOpen(true);
        reset();
        clearErrors();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('receivable.customers.store'), {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <BendaharaLayout>
            <Head title="Customer Piutang" />

            <div className="pt-6 pb-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-4 sm:px-0">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Customer</h1>
                            <p className="mt-1 text-sm text-gray-500 font-medium whitespace-nowrap">Monitoring piutang dan history transaksi pelanggan.</p>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={handleResetAll}
                                className="inline-flex items-center px-4 py-2 bg-white border border-red-100 rounded-xl font-bold text-xs text-red-600 uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg>
                                Reset
                            </button>

                             {/* Premium Export Dropdown */}
                             <div className="relative group">
                                <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-100 rounded-xl font-bold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm gap-2">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                     Export PDF
                                     <svg className="w-3 h-3 text-gray-400 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                 </button>
                                 
                                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-2">
                                     <a 
                                        href={route('receivable.export-pdf', { status: 'all' })} 
                                        target="_blank" 
                                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                        Semua Customer
                                    </a>
                                     <a 
                                        href={route('receivable.export-pdf', { status: 'lunas' })} 
                                        target="_blank" 
                                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-emerald-600 transition-colors border-t border-gray-50"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        Sudah Lunas
                                    </a>
                                     <a 
                                        href={route('receivable.export-pdf', { status: 'belum_lunas' })} 
                                        target="_blank" 
                                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-rose-600 transition-colors border-t border-gray-50"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        Belum Lunas
                                    </a>
                                </div>
                             </div>

                            <PrimaryButton onClick={openModal} className="!rounded-xl !py-2.5 !px-5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-95 text-[11px] !font-black !uppercase tracking-widest">
                                + Customer
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Filters & Search Toolbar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-all hover:shadow-md">
                        <div className="w-full md:w-1/3 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <TextInput
                                type="text"
                                className="w-full pl-10 !rounded-xl !border-gray-100 focus:!border-indigo-300 focus:!ring-indigo-100 transition-all"
                                placeholder="Cari nama, alamat, atau kontak..."
                                value={search}
                                onChange={onSearchChange}
                            />
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select 
                                value={status} 
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="border-gray-100 focus:border-indigo-300 focus:ring-indigo-100 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-gray-50/50"
                            >
                                <option value="">Semua Status</option>
                                <option value="belum_lunas">Belum Lunas</option>
                                <option value="lunas">Lunas</option>
                            </select>

                            <select 
                                value={sortBy} 
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="border-gray-100 focus:border-indigo-300 focus:ring-indigo-100 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-gray-50/50"
                            >
                                <option value="updated_at">Terbaru Diupdate</option>
                                <option value="created_at">Terbaru Dibuat</option>
                            </select>
                        </div>
                    </div>

                    {/* Customers Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map((customer) => {
                            const balance = (customer.receivable_transactions_sum_bill_amount || 0) - (customer.receivable_transactions_sum_payment_amount || 0);
                            const isLunas = balance <= 0;
                            const totalVol = parseFloat(customer.receivable_transactions_sum_volume) || 0;

                            return (
                                <Link 
                                    key={customer.id} 
                                    href={route('receivable.customers.show', customer.id)}
                                    className="block bg-white overflow-hidden shadow-sm sm:rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-2 relative group"
                                >
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-lg min-w-[2rem] text-center border border-indigo-100">
                                                ID-{customer.id}
                                            </div>
                                            <h3 className="text-lg font-black text-gray-800 truncate group-hover:text-indigo-600 transition-colors tracking-tight" title={customer.name}>
                                                {customer.name}
                                            </h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap ml-2 shadow-sm ${
                                            isLunas 
                                                ? 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-rose-100 text-rose-800'
                                        }`}>
                                            {isLunas ? 'LUNAS' : 'BELUM'}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3.5">
                                        {customer.address && (
                                              <div className="text-[11px] font-semibold text-gray-500 bg-amber-50 px-3 py-1.5 rounded-lg flex items-start gap-2 w-full mt-1 border border-amber-100/50">
                                                 <svg className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                 <span className="line-clamp-2">{customer.address}</span>
                                              </div>
                                        )}

                                        {customer.contact && (
                                             <div className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {customer.contact}
                                             </div>
                                        )}

                                        {!customer.address && !customer.contact && (
                                            <div className="h-7 text-xs italic text-gray-300">Data info tidak tersedia</div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 py-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total Volume</span>
                                                <span className="font-extrabold text-gray-700 text-sm">{totalVol.toLocaleString('id-ID')} m³</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-right">Pembayaran</span>
                                                <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(customer.receivable_transactions_sum_payment_amount || 0)}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center group-hover:bg-indigo-50/10 transition-colors">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sisa Piutang</span>
                                            <span className={`text-lg font-black tracking-tighter ${isLunas ? 'text-gray-300' : 'text-rose-600'}`}>
                                                {formatCurrency(balance)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Arrow icon hint on hover */}
                                    <div className="absolute right-3 top-[43%] translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-400">
                                        <svg className="w-10 h-10 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                        
                        {customers.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                <p className="text-gray-500">Belum ada data customer.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah Customer */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Tambah Customer Baru
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Customer" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="PT. Kontraktor Sejahtera"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="address" value="Alamat" />
                            <TextInput
                                id="address"
                                type="text"
                                name="address"
                                value={data.address}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Jl. Raya Utama No. 123"
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="contact" value="Kontak / No. HP (Optional)" />
                            <TextInput
                                id="contact"
                                type="text"
                                name="contact"
                                value={data.contact}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('contact', e.target.value)}
                                placeholder="08123456789"
                            />
                            <InputError message={errors.contact} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Keterangan (Optional)" />
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                rows="2"
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Catatan khusus customer ini..."
                            ></textarea>
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal} disabled={processing}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Customer'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
