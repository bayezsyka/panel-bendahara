import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import PageHeader from '@/Components/PageHeader'
import Modal from '@/Components/Modal'

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}

export default function Show({ mandor, stats, expenses, expenseTypes }) {
    const [showImageModal, setShowImageModal] = useState(null)
    const [sortBy, setSortBy] = useState('transacted_at')

    const sortedExpenses = [...expenses].sort((a, b) => {
        const dateA = new Date(a[sortBy]);
        const dateB = new Date(b[sortBy]);
        return dateB - dateA;
    });

    return (
        <BendaharaLayout>
            <Head title={`Pelaksana: ${mandor.name}`} />

            <PageHeader
                title={`Pelaksana: ${mandor.name}`}
                backLink={route('bendahara.mandors.index')}
                backLabel="Daftar Pelaksana"
                meta={
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        <a href={`https://wa.me/${mandor.whatsapp_number}`} target="_blank" className="hover:underline text-gray-900 font-medium">
                            {mandor.whatsapp_number}
                        </a>
                    </div>
                }
                actions={
                    <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                            <input 
                                type="date" 
                                className="border-0 focus:ring-0 text-sm p-1 text-gray-700 bg-transparent"
                                id="exportDate"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                            <button
                                onClick={() => {
                                    const date = document.getElementById('exportDate').value;
                                    if(date) {
                                        window.open(route('bendahara.mandors.export-daily', { mandor: mandor.id, date: date }), '_blank');
                                    } else {
                                        alert('Pilih tanggal terlebih dahulu');
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-indigo-100 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Export Harian
                            </button>
                         </div>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium">Total Proyek</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total_projects}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium">Proyek Berjalan</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.ongoing_projects}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium">Proyek Selesai</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed_projects}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium">Total Kelola Dana</div>
                    <div className="text-2xl font-bold text-indigo-600 mt-1">{formatRupiah(stats.total_expense)}</div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Daftar Proyek */}
                <div>
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Daftar Proyek</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mandor.projects && mandor.projects.length > 0 ? (
                            mandor.projects.map((project) => (
                                <div key={project.id} className="group flex flex-col bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition duration-200 overflow-hidden">
                                    <Link href={route('bendahara.projects.show', project.slug || project.id)} className="flex-1 p-5 block">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                project.status === 'ongoing' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                                {project.status === 'ongoing' ? 'Berjalan' : 'Selesai'}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(project.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition">
                                            {project.name}
                                        </h3>

                                        {/* Badge Bendera */}
                                        {project.bendera && (
                                            <div className="mb-3 inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-100 text-purple-700">
                                                🏢 {project.bendera.name}
                                            </div>
                                        )}
                                        
                                        <div className="space-y-2 mb-2">
                                            {(project.location || project.coordinates) && (
                                                <div className="flex items-start gap-2 text-xs text-gray-500 px-2">
                                                    <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <span className="line-clamp-1">{project.location || 'Lokasi Koordinat Tersedia'}</span>
                                                </div>
                                            )}
                                            {/* Total Expense Summary */}
                                            <div className="flex items-start gap-2 text-xs text-gray-500 px-2 pt-2 border-t border-gray-50">
                                                <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium text-gray-700">
                                                    {project.expenses_count} Transaksi
                                                </span>
                                            </div>
                                        </div>
                    
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-3 pt-3 border-t border-dashed border-gray-100">
                                            {project.description || 'Tidak ada deskripsi.'}
                                        </p>
                                    </Link>
                    
                                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-center items-center">
                                        <Link href={route('bendahara.projects.show', project.slug || project.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                            Lihat Detail Proyek
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-gray-500 font-medium">Pelaksana ini belum memegang proyek apapun.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expense Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="font-semibold text-gray-800">Riwayat Pengeluaran (Semua Proyek)</h3>
                        
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setSortBy('transacted_at')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                    sortBy === 'transacted_at' 
                                    ? 'bg-white text-indigo-700 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Tanggal Nota
                            </button>
                            <button
                                onClick={() => setSortBy('created_at')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                    sortBy === 'created_at' 
                                    ? 'bg-white text-indigo-700 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Tanggal Input
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                                            <div className="font-semibold text-gray-900">
                                                {new Date(expense[sortBy]).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                             {expense.project ? (
                                                <Link 
                                                    href={route('bendahara.projects.show', expense.project.slug || expense.project.id)}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                                >
                                                    {expense.project.name}
                                                </Link>
                                             ) : (
                                                <span className="text-gray-400 text-xs italic">-</span>
                                             )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-gray-800 mb-1">{expense.title}</div>
                                            
                                            {expense.items && expense.items.length > 0 ? (
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {expense.items.map((item, idx) => (
                                                        <li key={item.id || idx}>
                                                            • {item.name} <span className="text-xs text-gray-500">({item.quantity} x {formatRupiah(item.price)})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">Tidak ada detail item.</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center align-top">
                                            {expense.receipt_image ? (
                                                <button 
                                                    onClick={() => setShowImageModal(`/storage/${expense.receipt_image}`)}
                                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-medium underline"
                                                >
                                                    Lihat Foto
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 align-top">
                                            <div className="flex flex-col gap-2 items-end">
                                                <span>{formatRupiah(expense.amount)}</span>
                                                <a 
                                                    href={route('bendahara.expenses.print', expense.id)} 
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition"
                                                    title="Cetak Kwitansi"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                    Cetak
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {sortedExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Belum ada pengeluaran tercatat untuk pelaksana ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Image */}
            <Modal show={!!showImageModal} onClose={() => setShowImageModal(null)}>
                <div className="p-4">
                    <img src={showImageModal} alt="Bukti Transaksi" className="w-full h-auto rounded-lg" />
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={() => setShowImageModal(null)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-medium"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    )
}
