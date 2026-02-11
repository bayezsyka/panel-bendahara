import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { 
    Briefcase, 
    ChevronRight, 
    ArrowLeft,
    MapPin,
    BarChart3
} from 'lucide-react';

export default function CustomerDetail({ customer, projects }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const totalBill = projects.reduce((acc, curr) => acc + curr.total_bill, 0);
    const totalPaid = projects.reduce((acc, curr) => acc + curr.total_paid, 0);
    const totalRemaining = projects.reduce((acc, curr) => acc + curr.remaining, 0);

    return (
        <BendaharaLayout>
            <Head title={`Proyek ${customer.name}`} />

            <div className="space-y-6">
                <Link 
                    href={route('receivable.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="mr-1 w-4 h-4" />
                    Kembali ke Daftar Customer
                </Link>

                <PageHeader 
                    title={customer.name}
                    subtitle={`Daftar proyek dan status penagihan untuk customer ${customer.name}.`}
                    icon={Briefcase}
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Tagihan</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBill)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Dibayar</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-sm font-medium text-slate-500 mb-1">Sisa Piutang</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalRemaining)}</p>
                    </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
                            Status Proyek
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Proyek / Lokasi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tagihan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Terbayar</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Sisa</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.length > 0 ? (
                                    projects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{project.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center mt-0.5">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {project.location || 'Lokasi tidak ditentukan'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-900">
                                                {formatCurrency(project.total_bill)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                                {formatCurrency(project.total_paid)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`font-bold ${project.remaining > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                                    {formatCurrency(project.remaining)}
                                                </div>
                                            </td>
                                             <td className="px-6 py-4 text-center">
                                                {project.id ? (
                                                    <Link 
                                                        href={route('receivable.project.show', project.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                                    >
                                                        Tinjau Transaksi
                                                        <ChevronRight className="ml-1 w-4 h-4" />
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">ID Error</span>
                                                )}
                                             </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            Belum ada proyek untuk customer ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </BendaharaLayout>
    );
}
