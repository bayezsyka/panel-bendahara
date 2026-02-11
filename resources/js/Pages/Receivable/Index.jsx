import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { 
    Users, 
    ChevronRight, 
    Search, 
    FileText, 
    TrendingUp, 
    Wallet
} from 'lucide-react';

export default function Index({ customers }) {
    const [search, setSearch] = useState('');

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalReceivable = customers.reduce((acc, curr) => acc + curr.total_receivable, 0);

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
            <Head title="Piutang - Daftar Customer" />

            <div className="space-y-6">
                <PageHeader 
                    title="Daftar Piutang Customer"
                    subtitle="Monitor saldo piutang dan kelola penagihan untuk setiap customer Anda."
                    icon={Users}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Customer</p>
                            <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Piutang Berjalan</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalReceivable)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Proyek Aktif</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {customers.reduce((acc, curr) => acc + curr.projects_count, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customer Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-slate-900">Daftar Piutang Customer</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Cari customer..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Proyek</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Piutang</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{customer.name}</div>
                                                {customer.address && <div className="text-xs text-slate-500 line-clamp-1">{customer.address}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {customer.projects_count} Proyek
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`font-bold ${customer.total_receivable > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                                    {formatCurrency(customer.total_receivable)}
                                                </div>
                                            </td>
                                             <td className="px-6 py-4 text-center">
                                                {customer.id ? (
                                                    <Link 
                                                        href={route('receivable.customer.show', customer.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                                                    >
                                                        Detail
                                                        <ChevronRight className="ml-1 w-4 h-4" />
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Error</span>
                                                )}
                                             </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            Tidak ada data customer ditemukan.
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
