import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { 
    History, 
    ArrowLeft,
    Search,
    CreditCard,
    Calendar,
    ChevronRight,
    User
} from 'lucide-react';

export default function Payments({ payments }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <BendaharaLayout>
            <Head title="Riwayat Pembayaran" />

            <div className="space-y-6">
                <PageHeader 
                    title="Riwayat Pembayaran"
                    subtitle="Monitor seluruh arus kas masuk yang tercatat sebagai pelunasan piutang."
                    icon={History}
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-slate-900">Seluruh Transaksi Pembayaran</h3>
                        <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full">
                            Menampilkan {payments.from} - {payments.to} dari {payments.total} transaksi
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Penerima</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Jumlah</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-slate-900">
                                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                    {new Date(payment.date).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{payment.customer?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 italic">
                                                "{payment.description}"
                                                {payment.notes && <div className="text-[10px] text-slate-400">Nb: {payment.notes}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-black text-emerald-600">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                            </td>
                                             <td className="px-6 py-4 text-center">
                                                {payment.delivery_project_id ? (
                                                    <Link 
                                                        href={route('receivable.project.show', payment.delivery_project_id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                                                    >
                                                        Lihat Proyek
                                                        <ChevronRight className="ml-1 w-3 h-3" />
                                                    </Link>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-medium border border-slate-100">
                                                        Tanpa Proyek
                                                    </span>
                                                )}
                                             </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            Belum ada data pembayaran ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments.links.length > 3 && (
                        <div className="p-6 border-t border-slate-100 flex justify-center gap-1">
                            {payments.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        link.active 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
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
