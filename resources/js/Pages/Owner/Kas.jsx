import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import OwnerLayout from '@/Layouts/OwnerLayout';
import PageHeader from '@/Components/PageHeader';
import { formatDateInput } from '@/dateInput';

const rupiah = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0);
const rupiahCompact = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
    return String(v);
};

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
const fmtBulan = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    return `${MONTHS_ID[parseInt(m)-1]} '${y.slice(2)}`;
};

export default function Kas({ transactions, openingBalance, closingBalance, totalIn, totalOut, monthlySummary, filters }) {
    const [cashType, setCashType]     = useState(filters.cash_type);
    const [startDate, setStartDate]   = useState(filters.start_date);
    const [endDate, setEndDate]       = useState(filters.end_date);

    React.useEffect(() => {
        router.get(route('owner.kas'), { 
            cash_type: cashType, 
            start_date: startDate, 
            end_date: endDate 
        }, { 
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    }, [cashType, startDate, endDate]);

    const setQuickDate = (period) => {
        const today = new Date();
        let s = new Date(), e = new Date();
        if (period === 'today')    { /* s=e=today */ }
        else if (period === 'week'){ s = new Date(today); s.setDate(today.getDate() - 6); }
        else if (period === 'month'){ s = new Date(today.getFullYear(), today.getMonth(), 1); }
        else if (period === 'last_month') {
            s = new Date(today.getFullYear(), today.getMonth()-1, 1);
            e = new Date(today.getFullYear(), today.getMonth(), 0);
        }
        setStartDate(formatDateInput(s)); setEndDate(formatDateInput(e));
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-3 text-xs">
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{fmtBulan(label)}</p>
                {payload.map((e, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full inline-block" style={{ background: e.color }} />{e.name}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{rupiah(e.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <OwnerLayout header={
            <PageHeader
                title="Kas Harian"
            />
        }>
            <Head title="Kas Harian — Owner" />

            <div className="space-y-6">
                {/* Filter bar */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Cash type */}
                        <div className="w-full sm:w-auto">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Jenis Kas</label>
                            <select
                                value={cashType}
                                onChange={e => setCashType(e.target.value)}
                                className="w-full sm:w-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="kas_besar">Kas Besar</option>
                                <option value="kas_kecil">Kas Kecil</option>
                            </select>
                        </div>
                        {/* Date range */}
                        <div className="flex-1 min-w-[130px]">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tanggal Mulai</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-[130px]">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tanggal Akhir</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>

                        {/* Quick date shortcuts */}
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                            {[
                                { label: 'Hari Ini',   key: 'today' },
                                { label: '7 Hari',     key: 'week' },
                                { label: 'Bulan Ini',  key: 'month' },
                                { label: 'Bln Lalu',   key: 'last_month' },
                            ].map((q, idx) => (
                                <button key={`${q.key}-${idx}`} onClick={() => setQuickDate(q.key)}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap">
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Saldo Awal',    value: rupiah(openingBalance), cls: 'text-gray-900 dark:text-gray-100', bg: 'from-gray-50 dark:from-gray-800 to-white dark:to-gray-900',    ibg: 'bg-gray-100 dark:bg-gray-700',    ic: 'text-gray-500' },
                        { label: 'Total Masuk',   value: rupiah(totalIn),        cls: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-900', ibg: 'bg-emerald-100', ic: 'text-emerald-600' },
                        { label: 'Total Keluar',  value: rupiah(totalOut),       cls: 'text-red-600 dark:text-red-400',  bg: 'from-red-50 dark:from-red-900/20 to-white dark:to-gray-900',    ibg: 'bg-red-100',    ic: 'text-red-600' },
                        { label: 'Saldo Akhir',   value: rupiah(closingBalance), cls: closingBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400', bg: 'from-indigo-50 dark:from-indigo-900/20 to-white dark:to-gray-900', ibg: 'bg-indigo-100', ic: 'text-indigo-600' },
                    ].map(k => (
                        <div key={k.label} className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br ${k.bg} p-5 shadow-sm`}>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{k.label}</p>
                            <p className={`text-base font-bold tabular-nums mt-1 ${k.cls}`}>{k.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                    {/* Monthly bar chart */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Ringkasan 6 Bulan Terakhir</h3>
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer>
                                <BarChart data={monthlySummary} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                                    <XAxis dataKey="bulan_key" tickFormatter={fmtBulan} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={rupiahCompact} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="masuk"  name="Masuk"  fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                    <Bar dataKey="keluar" name="Keluar" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly summary table */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                        <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Tabel Bulanan</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Bulan</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Masuk</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Keluar</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Selisih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {monthlySummary.map(r => (
                                        <tr key={`row-${r.bulan_key}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">{r.bulan}</td>
                                            <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{rupiah(r.masuk)}</td>
                                            <td className="px-6 py-3 text-right text-red-500 dark:text-red-400 tabular-nums">{rupiah(r.keluar)}</td>
                                            <td className={`px-6 py-3 text-right font-semibold tabular-nums ${r.selisih >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{rupiah(r.selisih)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Transaction table */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Detail Transaksi</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{transactions.length} transaksi</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Tanggal</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Keterangan</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Sumber/Tujuan</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Masuk</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Keluar</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Tidak ada transaksi pada periode ini.</td></tr>
                                ) : transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{t.date}</td>
                                        <td className="px-6 py-3 text-gray-800 dark:text-gray-200 max-w-[220px] truncate">{t.description}</td>
                                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 max-w-[140px] truncate">{t.source}</td>
                                        <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{t.type === 'in' ? rupiah(t.amount) : '—'}</td>
                                        <td className="px-6 py-3 text-right text-red-500 dark:text-red-400 tabular-nums">{t.type === 'out' ? rupiah(t.amount) : '—'}</td>
                                        <td className={`px-6 py-3 text-right font-semibold tabular-nums ${t.running_balance >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}`}>{rupiah(t.running_balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PDF download shortcut */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Unduh Laporan Periode Ini</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{startDate} s/d {endDate} — {cashType === 'kas_besar' ? 'Kas Besar' : 'Kas Kecil'}</p>
                    </div>
                    <a
                        href={route('owner.reports.laporan-kas') + `?cash_type=${cashType}&start_date=${startDate}&end_date=${endDate}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Unduh PDF
                    </a>
                </div>
            </div>
        </OwnerLayout>
    );
}
