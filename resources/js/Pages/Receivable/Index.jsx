import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { SearchInput, Badge, StatCard, EmptyState, Card } from '@/Components/ui';
import { 
    Users, 
    ChevronRight, 
    FileText, 
    TrendingUp, 
} from 'lucide-react';

export default function Index({ customers }) {
    const [search, setSearch] = useState('');

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalReceivable = customers.reduce((acc, curr) => acc + curr.total_receivable, 0);

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatCard
                        title="Total Customer"
                        value={customers.length}
                        icon={<Users className="w-6 h-6" />}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        title="Total Piutang Berjalan"
                        value={formatCurrency(totalReceivable)}
                        icon={<TrendingUp className="w-6 h-6" />}
                        iconBg="bg-indigo-50"
                        iconColor="text-indigo-600"
                    />
                    <StatCard
                        title="Total Proyek Aktif"
                        value={customers.reduce((acc, curr) => acc + curr.projects_count, 0)}
                        icon={<FileText className="w-6 h-6" />}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />
                </div>

                {/* Search */}
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Cari customer..."
                />

                {/* Customer Grid */}
                {filteredCustomers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCustomers.map((customer) => (
                            <Card key={customer.id} noPadding hover className="group flex flex-col overflow-hidden">
                                <Link 
                                    href={route('receivable.customer.show', customer.slug)}
                                    className="p-6 flex-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="blue" size="md">
                                                {customer.projects_count} Proyek
                                            </Badge>
                                            <Badge 
                                                variant={customer.total_receivable > 0 ? 'red' : 'green'} 
                                                size="md"
                                                dot
                                            >
                                                {customer.total_receivable > 0 ? 'Belum Lunas' : 'Lunas'}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                        {customer.name}
                                    </h3>
                                    
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="line-clamp-1">{customer.address || 'Alamat tidak tersedia'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {customer.contact || '-'}
                                        </div>
                                    </div>

                                    <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Piutang</p>
                                        <p className={`text-lg font-black ${customer.total_receivable > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {formatCurrency(customer.total_receivable)}
                                        </p>
                                    </div>
                                </Link>

                                <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex justify-end items-center mt-auto">
                                    <Link 
                                        href={route('receivable.customer.show', customer.slug)} 
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest flex items-center gap-1"
                                    >
                                        Kelola Piutang
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <EmptyState
                            title="Tidak Ada Data"
                            description="Tidak ada customer yang ditemukan dengan kriteria pencarian Anda."
                            icon={<Users className="w-8 h-8 text-gray-200" />}
                        />
                    </Card>
                )}
            </div>
        </BendaharaLayout>
    );
}
