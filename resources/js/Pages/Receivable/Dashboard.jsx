import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    TrendingUp, 
    ArrowUpRight,
    Search,
    ChevronRight,
    Wallet
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function Dashboard({ stats, top_customers }) {
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

    const chartData = top_customers.map(c => ({
        name: c.name.split(' ').slice(0, 2).join(' '),
        value: c.total_receivable
    }));

    const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

    return (
        <BendaharaLayout>
            <Head title="Dashboard Piutang" />

            <div className="space-y-6">
                <PageHeader 
                    title="Dashboard Piutang"
                    subtitle="Ringkasan eksekutif piutang operasional dan status penagihan."
                    icon={LayoutDashboard}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Piutang" 
                        value={formatCurrency(stats.total_receivable)} 
                        icon={Wallet} 
                        color="indigo" 
                    />
                    <StatCard 
                        title="Bayar Bulan Ini" 
                        value={formatCurrency(stats.total_paid_month)} 
                        icon={TrendingUp} 
                        color="emerald" 
                    />
                    <StatCard 
                        title="Total Customer" 
                        value={stats.customer_count} 
                        icon={Users} 
                        color="blue" 
                    />
                    <StatCard 
                        title="Total Proyek" 
                        value={stats.project_count} 
                        icon={Briefcase} 
                        color="amber" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Customers Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800">Top 5 Piutang Customer</h3>
                            <Link href={route('receivable.index')} className="text-xs text-indigo-600 font-bold hover:underline flex items-center">
                                Lihat Semua <ArrowUpRight className="ml-1 w-3 h-3" />
                            </Link>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.06} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis hide />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-6">Daftar Customer Teratas</h3>
                        <div className="space-y-4">
                            {top_customers.map((c) => (
                                <Link 
                                    key={c.id} 
                                    href={c.slug ? route('receivable.customer.show', c.slug) : '#'}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                                        <p className="text-xs text-slate-500">{c.projects_count} Proyek</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-bold text-red-600">{formatCurrency(c.total_receivable)}</p>
                                        <div className="flex items-center justify-end text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Detail <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </BendaharaLayout>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    const colorMap = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${colorMap[color] || colorMap.indigo}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
}
