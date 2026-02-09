import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Show({ project }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <BendaharaLayout>
            <Head title={`Proyek: ${project.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <Link 
                            href={route('delivery.customers.show', project.customer_id)}
                            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1 mb-2 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Kembali ke Customer
                        </Link>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded border border-blue-100">
                                Berjalan
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Customer: <Link href={route('delivery.customers.show', project.customer_id)} className="text-indigo-600 hover:underline">{project.customer.name}</Link>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link 
                            href={route('delivery.projects.edit', project.id)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm text-sm transition-colors"
                        >
                            Edit Proyek
                        </Link>
                        <Link 
                            href={route('delivery.shipments.create', { project_id: project.id })}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm text-sm transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Buat Surat Jalan
                        </Link>
                    </div>
                </div>

                {/* Detail Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Proyek</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Lokasi Proyek</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.location || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Sub-Contractor / Penerima</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.sub_contractor || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Kontak Lapangan / PIC</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.contact_person || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Pekerjaan</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.work_type || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Estimasi & Mutu</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Default Mutu Beton</p>
                                <p className="text-sm text-gray-900 font-bold mt-1">
                                    {project.default_concrete_grade ? (
                                        <span className="flex items-center justify-between">
                                            {project.default_concrete_grade.code}
                                            <span className="text-gray-500 font-normal">{formatCurrency(project.default_concrete_grade.price)}</span>
                                        </span>
                                    ) : '-'}
                                </p>
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-xs text-gray-400 font-medium uppercase">Total Ritase</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{project.shipments.length} <span className="text-xs text-gray-400 font-medium">Surat Jalan</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rekapitulasi Tiket / Surat Jalan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">Rekapitulasi Tiket</h3>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                {project.shipments.length} Surat Jalan
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {project.shipments.length > 0 && (
                                <a 
                                    href={route('delivery.projects.export-recap-pdf', project.id)}
                                    target="_blank"
                                    className="text-xs bg-white border border-gray-200 px-3 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Cetak Rekap (PDF)
                                </a>
                            )}
                        </div>
                    </div>
                    
                    {project.shipments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">No</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">DN (Ticket)</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rit</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mutu</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Slump</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Volume</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">No Polisi</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supir</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Nilai (Rp)</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {project.shipments.map((shipment, index) => (
                                        <tr key={shipment.id} className="hover:bg-gray-50/70 transition-colors group">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-400 text-center">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                                {new Date(shipment.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900 underline decoration-indigo-200 decoration-2 underline-offset-4">{shipment.docket_number}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">Rit {shipment.rit_number}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded border border-indigo-100 italic">
                                                    {shipment.concrete_grade.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 font-medium italic">{shipment.slump || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-black text-right">{shipment.volume} m³</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 font-bold uppercase">{shipment.vehicle_number || '-'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{shipment.driver_name || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-bold text-right tabular-nums">{formatCurrency(shipment.total_price)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link 
                                                        href={route('delivery.shipments.edit', shipment.id)}
                                                        className="p-1 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </Link>
                                                    <Link 
                                                        href={route('delivery.shipments.show', shipment.id)}
                                                        className="p-1 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
                                                        title="Detail"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/80 font-black border-t-2 border-gray-100">
                                    <tr>
                                        <td colSpan="6" className="px-4 py-4 text-xs text-gray-400 uppercase tracking-widest text-right">Total Rekapitulasi</td>
                                        <td className="px-4 py-4 text-sm text-gray-900 text-right tabular-nums">
                                            {project.shipments.reduce((sum, s) => sum + parseFloat(s.volume), 0).toFixed(2)} m³
                                        </td>
                                        <td colSpan="2"></td>
                                        <td className="px-4 py-4 text-base text-indigo-700 text-right tabular-nums">
                                            {formatCurrency(project.shipments.reduce((sum, s) => sum + parseFloat(s.total_price), 0))}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Belum Ada Pengiriman</h4>
                            <p className="text-gray-500 mt-1 max-w-sm">Siapkan surat jalan pertama untuk mulai mencatat pengiriman beton pada proyek ini.</p>
                            <Link 
                                href={route('delivery.shipments.create', { project_id: project.id })}
                                className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                + Mulai Buat Surat Jalan
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </BendaharaLayout>
    );
}
