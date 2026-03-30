import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import OwnerLayout from '@/Layouts/OwnerLayout';
import PageHeader from '@/Components/PageHeader';

const rupiah = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0);
const rupiahCompact = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
    return String(v);
};
const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
const fmtBulan = (ym) => { if (!ym) return ''; const [y,m] = ym.split('-'); return `${MONTHS_ID[parseInt(m)-1]} '${y.slice(2)}`; };
const COLORS = ['#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6'];

const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
        {status === 'ongoing' ? 'Berjalan' : 'Selesai'}
    </span>
);

export default function Proyek({ projectSpending, monthly, byType, latestExpenses, allProjects, filters }) {
    const [search,    setSearch]    = useState(filters.search ?? '');
    const [months,    setMonths]    = useState(String(filters.months));
    const [projectId, setProjectId] = useState(filters.project_id ?? '');

    const applyFilter = () => {
        router.get(route('owner.proyek'), {
            search:     search || undefined,
            months,
            project_id: projectId || undefined,
        }, { preserveState: true });
    };

    const selectedProject = allProjects.find(p => p.id == projectId);

    const grandTotal = projectSpending.reduce((s, p) => s + p.total_all, 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
                <p className="font-semibold text-gray-700 mb-1">{fmtBulan(label)}</p>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Pengeluaran</span>
                    <span className="font-medium text-gray-900">{rupiah(payload[0]?.value)}</span>
                </div>
            </div>
        );
    };

    return (
        <OwnerLayout header={<PageHeader title="Proyek Konstruksi" />}>
            <Head title="Proyek — Owner" />

            <div className="space-y-6">
                {/* Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Text search */}
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Cari Proyek</label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilter()}
                                    placeholder="Ketik nama proyek..."
                                    className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </div>
                        {/* Dropdown */}
                        <div className="min-w-[180px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Proyek Spesifik</label>
                            <select value={projectId} onChange={e => setProjectId(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="">Semua Proyek</option>
                                {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        {/* Period */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Periode</label>
                            <select value={months} onChange={e => setMonths(e.target.value)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="1">1 bulan</option>
                                <option value="3">3 bulan</option>
                                <option value="6">6 bulan</option>
                                <option value="12">12 bulan</option>
                                <option value="24">24 bulan</option>
                            </select>
                        </div>
                        <button onClick={applyFilter} className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors">
                            Tampilkan
                        </button>
                        {/* PDF — project scoped */}
                        <a href={route('owner.reports.laporan-proyek') + (projectId ? `?project_id=${projectId}` : '')}
                            target="_blank" rel="noopener noreferrer"
                            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            {selectedProject ? `PDF — ${selectedProject.name}` : 'Unduh PDF Rekap'}
                        </a>
                    </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Total Pengeluaran (Semua Waktu)', value: rupiah(grandTotal),                                    bg: 'from-red-50 to-white',    ic: 'text-red-600'    },
                        { label: 'Total Pengeluaran Periode Ini',   value: rupiah(projectSpending.reduce((s,p)=>s+p.total_period,0)), bg: 'from-orange-50 to-white', ic: 'text-orange-600' },
                        { label: 'Jumlah Proyek',                   value: projectSpending.length,                                 bg: 'from-blue-50 to-white',   ic: 'text-blue-600'   },
                        { label: 'Total Transaksi',                 value: projectSpending.reduce((s,p)=>s+p.jumlah_transaksi,0), bg: 'from-indigo-50 to-white',  ic: 'text-indigo-600' },
                    ].map(k => (
                        <div key={k.label} className={`rounded-xl border border-gray-200 bg-gradient-to-br ${k.bg} p-5 shadow-sm`}>
                            <p className="text-xs font-medium text-gray-500 leading-tight">{k.label}</p>
                            <p className={`text-lg font-bold tabular-nums mt-1 ${k.ic}`}>{k.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                    {/* Tren bulanan */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Tren Pengeluaran Bulanan</h3>
                        <p className="text-sm text-gray-500 mb-4">Total pengeluaran per bulan dalam {months} bulan terakhir</p>
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer>
                                <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                                    <XAxis dataKey="bulan" tickFormatter={fmtBulan} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={rupiahCompact} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="total" name="Pengeluaran" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Breakdown tipe biaya */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-base font-semibold text-gray-900">Breakdown Tipe Biaya</h3>
                            <p className="text-sm text-gray-500">Distribusi pengeluaran per kategori</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Tipe Biaya</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500">Total</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500">Porsi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {byType.length === 0 ? (
                                        <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada data.</td></tr>
                                    ) : (() => {
                                        const max = Math.max(...byType.map(t => t.total), 1);
                                        return byType.map((t, i) => {
                                            const pct = Math.round((t.total / max) * 100);
                                            return (
                                                <tr key={t.name} className="hover:bg-gray-50">
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                            <span className="font-medium text-gray-800">{t.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-semibold text-gray-900 tabular-nums">{rupiah(t.total)}</td>
                                                    <td className="px-6 py-3 w-32">
                                                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Per-project table */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Pengeluaran per Proyek</h3>
                            <p className="text-sm text-gray-500">Dibandingkan total semua waktu</p>
                        </div>
                        <a href={route('owner.reports.laporan-proyek')} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Unduh PDF
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">#</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Proyek</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500">Periode Ini</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500">Total Semua Waktu</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500">Transaksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {projectSpending.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Belum ada data.</td></tr>
                                ) : projectSpending.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-xs font-bold text-gray-400">{i+1}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="font-medium text-gray-900">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                                        <td className="px-6 py-3 text-right tabular-nums text-indigo-600 font-medium">{rupiah(p.total_period)}</td>
                                        <td className="px-6 py-3 text-right tabular-nums font-semibold text-gray-900">{rupiah(p.total_all)}</td>
                                        <td className="px-6 py-3 text-right text-gray-500">{p.jumlah_transaksi}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {projectSpending.length > 0 && (
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-3 text-xs font-semibold text-gray-600">Total</td>
                                        <td className="px-6 py-3 text-right font-bold text-gray-900 tabular-nums">{rupiah(grandTotal)}</td>
                                        <td className="px-6 py-3 text-right font-semibold text-gray-600">{projectSpending.reduce((s,p)=>s+p.jumlah_transaksi,0)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Latest expenses */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h3 className="text-base font-semibold text-gray-900">50 Transaksi Terbaru</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Tanggal</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Proyek</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Tipe</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Keterangan</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {latestExpenses.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Belum ada data.</td></tr>
                                ) : latestExpenses.map(e => (
                                    <tr key={e.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{e.date}</td>
                                        <td className="px-6 py-3 font-medium text-gray-800 max-w-[160px] truncate">{e.project}</td>
                                        <td className="px-6 py-3 text-gray-500 max-w-[120px] truncate">{e.type}</td>
                                        <td className="px-6 py-3 text-gray-500 max-w-[200px] truncate">{e.description}</td>
                                        <td className="px-6 py-3 text-right font-semibold text-gray-900 tabular-nums">{rupiah(e.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
