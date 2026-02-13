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
        const number = Number(value);
        if (isNaN(number)) return 'Rp0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
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

                <div className="flex justify-between items-center">
                    <PageHeader 
                        title={customer.name}
                        subtitle={`Daftar proyek dan status penagihan untuk customer ${customer.name}.`}
                        icon={Briefcase}
                    />

                </div>

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

                {/* Projects Grid Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Status Piutang per Proyek</h3>
                    </div>

                    {projects && projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((project) => (
                                <div 
                                    key={project.id} 
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex flex-col"
                                >
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
                                                {project.name}
                                            </h4>
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${project.remaining > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                                {project.remaining > 0 ? 'Belum Lunas' : 'Lunas'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-start gap-2 text-[11px] text-gray-500 font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                                <span className="line-clamp-1">{project.location || 'Lokasi tidak tersedia'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Tagihan</p>
                                                <p className="text-sm font-bold text-gray-900">{formatCurrency(project.total_bill)}</p>
                                                {project.has_ppn && (
                                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                        (DPP: {formatCurrency(project.total_bill_dpp)})
                                                    </p>
                                                )}
                                            </div>
                                            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Terbayar</p>
                                                <p className="text-sm font-bold text-emerald-700">{formatCurrency(project.total_paid)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 p-3 bg-red-50/30 rounded-xl border border-red-100/30">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Sisa Piutang</p>
                                                <p className="text-base font-black text-red-600">{formatCurrency(project.remaining)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-end">
                                        <Link 
                                            href={route('receivable.project.show', project.slug)}
                                            className="inline-flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                                        >
                                            Kelola Keuangan Proyek →
                                        </Link>
                                    </div>
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
