import React, { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import PageHeader from '@/Components/PageHeader'
import { Badge, Card, SearchInput } from '@/Components/ui'
import Swal from 'sweetalert2'

export default function Trash({ trashedProjects = [] }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('')

    const filteredProjects = trashedProjects.filter(project => {
        const searchLower = search.toLowerCase()
        return project.name.toLowerCase().includes(searchLower) ||
            (project.customer && project.customer.name.toLowerCase().includes(searchLower)) ||
            (project.location && project.location.toLowerCase().includes(searchLower))
    })

    const restoreProject = (id, name) => {
        Swal.fire({
            title: 'Pulihkan Proyek?',
            html: `<p class="text-sm text-gray-500">Proyek <strong>"${name}"</strong> akan dipulihkan kembali ke daftar aktif.</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Pulihkan!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('delivery.projects.restore', id), {}, {
                    preserveScroll: true,
                });
            }
        });
    }

    return (
        <BendaharaLayout>
            <Head title="Sampah Proyek Pengiriman" />

            <div className="space-y-6">
                <PageHeader
                    title="Sampah (Proyek Delivery/Mix)"
                    backLink={route('delivery.customers.index')}
                    backLabel="Kembali ke Customer"
                />

                <Card className="p-4 bg-orange-50/30 dark:bg-orange-500/5 border-dashed border-2 border-orange-200 dark:border-orange-500/20">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Keranjang Sampah Proyek</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Daftar proyek pengiriman yang dihapus sementara. Anda dapat memulihkannya kapan saja ke Customer terkait.</p>
                            </div>
                        </div>
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Cari di keranjang sampah..."
                            className="w-full md:w-72"
                        />
                    </div>
                </Card>

                <div className="bg-white dark:bg-[#222238] rounded-xl border border-gray-200 dark:border-gray-700/40 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/40">
                            <thead className="bg-gray-50 dark:bg-[#1a1a2e]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Proyek</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dihapus Pada</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-[#222238] divide-y divide-gray-200 dark:divide-gray-700/40">
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-indigo-500/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{project.name}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">{project.code || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{project.customer?.name || 'Customer Terhapus'}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 truncate max-w-xs">{project.location || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 dark:text-gray-300">{new Date(project.deleted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(project.deleted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => restoreProject(project.id, project.name)}
                                                    className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-all text-xs"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Pulihkan
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span className="text-sm font-medium">Tidak ada proyek pengiriman di sampah</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </BendaharaLayout>
    )
}
