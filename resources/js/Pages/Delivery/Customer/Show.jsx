import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { SearchInput } from '@/Components/ui';
import { useState, useEffect } from 'react';

export default function Show({ customer, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(
                    route('delivery.customers.show', customer.slug),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);
    return (
        <BendaharaLayout>
            <Head title={`Customer: ${customer.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <Link 
                            href={route('delivery.customers.index')}
                            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1 mb-2 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Kembali
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {customer.address || 'Alamat tidak tersedia'}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {customer.contact || '-'}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                NPWP: {customer.npwp || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Projects Grid Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Proyek Dipesan</h3>
                        <div className="flex items-center gap-3">
                            <SearchInput
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Cari proyek..."
                                size="sm"
                            />
                            <Link 
                                href={route('delivery.projects.create', { customer_id: customer.id })}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap active:scale-95"
                            >
                                + Tambah Proyek
                            </Link>
                        </div>
                    </div>

                    {customer.delivery_projects && customer.delivery_projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {customer.delivery_projects.map((project) => (
                                <div 
                                    key={project.id} 
                                    className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
                                >
                                    <Link 
                                        href={route('delivery.projects.show', project.slug)}
                                        className="block p-5"
                                    >
                                        <div className="flex justify-between items-start mb-3 pr-6">
                                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
                                                {project.name}
                                            </h4>
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded border border-blue-100">
                                                Running
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2 text-[11px] text-gray-500 font-medium">
                                                <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="line-clamp-1">{project.location || 'Lokasi tidak tersedia'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {project.work_type || 'Pekerjaan Umum'}
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                                            <div className="inline-flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                Lihat Unit Rekapitulasi →
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (confirm('Yakin ingin menghapus proyek ini?')) {
                                                router.delete(route('delivery.projects.destroy', project.slug));
                                            }
                                        }}
                                        className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                                        title="Hapus Proyek"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
                            <p className="text-sm text-gray-500 font-medium italic">Belum ada proyek terdaftar untuk customer ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </BendaharaLayout>
    );
}
