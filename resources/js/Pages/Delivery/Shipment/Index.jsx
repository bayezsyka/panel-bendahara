import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ shipments }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <BendaharaLayout>
            <Head title="Rekap Pengiriman Beton" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Rekap Pengiriman</h2>
                        <p className="text-sm text-gray-500 mt-1">Daftar seluruh surat jalan pengiriman beton</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Tiket</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer / Proyek</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mutu</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Volume</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Harga</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {shipments.data.length > 0 ? (
                                    shipments.data.map((shipment) => (
                                        <tr key={shipment.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{shipment.docket_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(shipment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{shipment.project.customer.name}</div>
                                                <Link 
                                                    href={route('delivery.projects.show', shipment.delivery_project_id)}
                                                    className="text-xs text-indigo-600 hover:underline font-medium"
                                                >
                                                    {shipment.project.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-indigo-600 font-bold">{shipment.concrete_grade.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-bold text-right">{shipment.volume} m³</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-black text-right">{formatCurrency(shipment.total_price)}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <Link 
                                                    href={route('delivery.shipments.edit', shipment.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 mx-1 text-xs font-bold"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500 italic">
                                            Belum ada data pengiriman
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {shipments.links && shipments.links.length > 3 && (
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-center gap-1">
                            {shipments.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                        link.active 
                                            ? 'bg-indigo-600 text-white' 
                                            : (link.url ? 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200' : 'text-gray-300 cursor-not-allowed')
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </BendaharaLayout>
    );
}
