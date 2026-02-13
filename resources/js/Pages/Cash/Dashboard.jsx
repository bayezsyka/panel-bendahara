import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ 
    totalInKasBesar, totalOutKasBesar, balanceKasBesar, kasBesarTransactions,
    totalInKasKecil, totalOutKasKecil, balanceKasKecil, kasKecilTransactions,
}) {
    // Helper functions
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const totalBalance = (Number(balanceKasBesar) || 0) + (Number(balanceKasKecil) || 0);

    return (
        <BendaharaLayout>
            <Head title="Dashboard Kas" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Kas</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ringkasan dan riwayat transaksi kas besar & kecil</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-6">
                    {/* Overall Balance Card */}
                    <div className="group relative overflow-hidden bg-white dark:bg-[#222238] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                        <div className="absolute right-0 top-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full bg-blue-50/50 dark:bg-blue-500/10 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-500/20 transition-colors"></div>
                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Saldo</p>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-gray-100 mt-2 tracking-tight">{formatRupiah(totalBalance)}</h3>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Gabungan Kas Besar & Kas Kecil</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Link href={route('kas.kas-besar')} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                    Detail Kas Besar
                                </Link>
                                <Link href={route('kas.kas-kecil')} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                    Detail Kas Kecil
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kas Besar Card */}
                        <div className="group relative overflow-hidden bg-white dark:bg-[#222238] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-50/50 dark:bg-indigo-500/10 group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-500/20 transition-colors"></div>
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Kas Besar</p>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatRupiah(balanceKasBesar)}</h3>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-gray-700/50">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Masuk</p>
                                        <p className="font-semibold text-emerald-600 underline decoration-emerald-100 dark:decoration-emerald-900/50 underline-offset-4">{formatRupiah(totalInKasBesar)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Keluar</p>
                                        <p className="font-semibold text-red-600 underline decoration-red-100 dark:decoration-red-900/50 underline-offset-4">{formatRupiah(totalOutKasBesar)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kas Kecil Card */}
                        <div className="group relative overflow-hidden bg-white dark:bg-[#222238] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-50/50 dark:bg-purple-500/10 group-hover:bg-purple-100/50 dark:group-hover:bg-purple-500/20 transition-colors"></div>
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Kas Kecil</p>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatRupiah(balanceKasKecil)}</h3>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-gray-700/50">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Masuk</p>
                                        <p className="font-semibold text-emerald-600 underline decoration-emerald-100 dark:decoration-emerald-900/50 underline-offset-4">{formatRupiah(totalInKasKecil)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Keluar</p>
                                        <p className="font-semibold text-red-600 underline decoration-red-100 dark:decoration-red-900/50 underline-offset-4">{formatRupiah(totalOutKasKecil)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Kas Besar Table */}
                    <div className="bg-white dark:bg-[#222238] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Riwayat Kas Besar</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 Transaksi Terakhir</p>
                            </div>
                            <Link href={route('kas.kas-besar')} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline">
                                Lihat Semua &rarr;
                            </Link>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            {kasBesarTransactions && kasBesarTransactions.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                        {kasBesarTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{t.description}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {t.type === 'in' ? (t.cash_source?.name || 'Sumber Lain') : (t.cash_expense_type?.name || 'Biaya Lain')}
                                                    </p>
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    Belum ada transaksi di Kas Besar
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kas Kecil Table */}
                    <div className="bg-white dark:bg-[#222238] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Riwayat Kas Kecil</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 Transaksi Terakhir</p>
                            </div>
                            <Link href={route('kas.kas-kecil')} className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 hover:underline">
                                Lihat Semua &rarr;
                            </Link>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            {kasKecilTransactions && kasKecilTransactions.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                        {kasKecilTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{t.description}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {t.type === 'in' ? (t.cash_source?.name || 'Internal Transfer/Lainnya') : (t.cash_expense_type?.name || 'Biaya Lain')}
                                                    </p>
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    Belum ada transaksi di Kas Kecil
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BendaharaLayout>
    );
}
