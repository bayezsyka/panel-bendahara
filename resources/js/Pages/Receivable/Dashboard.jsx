import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ totalOutstanding, totalVolume, customerCount, customerUnpaid, monthlyStats }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <BendaharaLayout>
            <Head title="Dashboard Piutang & Analitik" />
            <div className="py-12 bg-gray-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analitik Piutang</h1>
                            <p className="text-gray-500 font-medium mt-1">Status keuangan dan performa penagihan terkini.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a 
                                href={route('receivable.export-pdf')} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export PDF
                            </a>
                            <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Live Updates</span>
                            </div>
                        </div>
                    </div>

                    {/* Premium Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Stat 1: Piutang */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-indigo-50 w-fit rounded-2xl mb-4">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sisa Piutang</span>
                                <div className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{formatCurrency(totalOutstanding)}</div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">{customerUnpaid} Customer</span>
                                    <span className="text-[10px] text-gray-400 font-medium italic">Belum melunasi tagihan</span>
                                </div>
                            </div>
                        </div>

                        {/* Stat 2: Volume */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <svg className="w-24 h-24 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-7-7zm0 1.5L18.5 9H13V3.5zM6 20V4h6v6h6v10H6z"/></svg>
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-emerald-50 w-fit rounded-2xl mb-4">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume Terkirim</span>
                                <div className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{totalVolume.toLocaleString('id-ID')} <span className="text-lg text-gray-400">m³</span></div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Kumulatif</span>
                                    <span className="text-[10px] text-gray-400 font-medium italic">Total seluruh pesanan</span>
                                </div>
                            </div>
                        </div>

                        {/* Stat 3: Customers */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <svg className="w-24 h-24 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-amber-50 w-fit rounded-2xl mb-4">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Basis Customer</span>
                                <div className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{customerCount} <span className="text-lg text-gray-400">Entitas</span></div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">Aktif</span>
                                    <span className="text-[10px] text-gray-400 font-medium italic">Terdaftar dalam sistem</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-3xl p-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Tren Performa Bulanan</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-widest">Tahun {new Date().getFullYear()}</p>
                            </div>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-900 rounded-sm"></div> <span className="text-gray-600">Tagihan</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> <span className="text-gray-600">Pembayaran</span></div>
                            </div>
                        </div>

                        <div className="h-72 flex items-end gap-3 sm:gap-6 border-b border-gray-100 pb-4 overflow-x-auto custom-scrollbar">
                            {monthlyStats.length > 0 ? monthlyStats.map((stat, index) => {
                                const maxVal = Math.max(...monthlyStats.map(s => Math.max(parseFloat(s.total_bill), parseFloat(s.total_payment))), 1);
                                const billHeight = (parseFloat(stat.total_bill) / maxVal) * 100;
                                const payHeight = (parseFloat(stat.total_payment) / maxVal) * 100;

                                return (
                                    <div key={index} className="flex flex-col items-center gap-3 group w-20 flex-shrink-0">
                                        <div className="w-full flex items-end gap-1.5 h-60 relative px-2">
                                            <div 
                                                style={{ height: `${Math.max(billHeight, 2)}%` }} 
                                                className="w-1/2 bg-gray-900 rounded-t-lg relative group-hover:bg-gray-800 transition-all shadow-lg shadow-gray-200/50"
                                                title={`Tagihan: ${formatCurrency(stat.total_bill)}`}
                                            ></div>
                                            <div 
                                                style={{ height: `${Math.max(payHeight, 2)}%` }} 
                                                className="w-1/2 bg-emerald-500 rounded-t-lg relative group-hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200/50"
                                                title={`Bayar: ${formatCurrency(stat.total_payment)}`}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Bulan {stat.month}</span>
                                    </div>
                                )
                            }) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 italic">Belum ada data transaksi tahun ini</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </BendaharaLayout>
    );
}
