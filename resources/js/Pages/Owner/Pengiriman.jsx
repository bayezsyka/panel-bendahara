import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import OwnerLayout from '@/Layouts/OwnerLayout';
import PageHeader from '@/Components/PageHeader';

// ─── Helpers ────────────────────────────────────────────────────────────────
const rupiah   = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n ?? 0);
const vol      = (n) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n ?? 0) + ' m³';
const fmtNum   = (n) => new Intl.NumberFormat('id-ID').format(n ?? 0);
const rupiahC  = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}jt`;
    return String(v);
};
const COLORS = ['#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#14b8a6','#22c55e','#f97316','#f43f5e'];

// ─── Tooltip ────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl bg-white border border-gray-100 shadow-lg p-3 text-xs min-w-[140px]">
            <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
            {payload.map((e, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-gray-500">
                        <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                        {e.name}
                    </span>
                    <span className="font-medium text-gray-900">
                        {e.dataKey === 'volume' ? vol(e.value) : rupiah(e.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, color }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className={`text-lg font-bold tabular-nums mt-0.5 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

// ─── Panel ───────────────────────────────────────────────────────────────────
const Panel = ({ title, subtitle, children }) => (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {title && (
            <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Pengiriman({ summary, trend, per_customer, per_mutu, recent_shipments, projects, filters }) {

    const [period,    setPeriod]    = useState(filters.period ?? '30');
    const [projectId, setProjectId] = useState(filters.project_id ?? '');
    const [search,    setSearch]    = useState(filters.search ?? '');

    const applyFilter = () => {
        router.get(route('owner.pengiriman'), {
            period,
            project_id: projectId || undefined,
            search:     search || undefined,
        }, { preserveScroll: true });
    };

    const selectedProject = projects.find(p => p.id == projectId);

    const PERIOD_OPTS = [
        { value: '7',   label: '7 Hari' },
        { value: '30',  label: '30 Hari' },
        { value: '90',  label: '3 Bulan' },
        { value: '365', label: '1 Tahun' },
    ];

    return (
        <OwnerLayout header={<PageHeader title="Pengiriman & Armada" />}>
            <Head title="Owner — Pengiriman" />

            <div className="space-y-6">
                {/* Filter bar */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Text search */}
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Cari Proyek / Customer</label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilter()}
                                    placeholder="Ketik nama proyek atau customer..."
                                    className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </div>
                        {/* Dropdown exact project */}
                        <div className="min-w-[180px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Proyek Spesifik</label>
                            <select value={projectId} onChange={e => setProjectId(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="">Semua Proyek</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        {/* Period */}
                        <div className="w-full sm:w-auto">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Periode</label>
                            <select value={period} onChange={e => setPeriod(e.target.value)}
                                className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                {PERIOD_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <button onClick={applyFilter}
                            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap">
                            Tampilkan
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <KpiCard title="Total Volume"         value={vol(summary.total_volume)}   sub="kubikasi dikirim"                      color="text-indigo-600" />
                    <KpiCard title="Total Nilai Kiriman"  value={rupiah(summary.total_nilai)}  sub="sebelum pembayaran"                    color="text-emerald-600" />
                    <KpiCard title="Jumlah Kiriman"       value={fmtNum(summary.total_kiriman)} sub="trip pengiriman"                     color="text-blue-600" />
                    <KpiCard title="Rata-rata / Kiriman"  value={vol(summary.avg_volume_per_kiriman)} sub="volume per trip"               color="text-purple-600" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                    {/* Trend volume mingguan */}
                    <Panel title="Tren Volume Mingguan" subtitle="Volume m³ dan nilai per minggu">
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer>
                                <BarChart data={trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={v => v + ' m³'} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="volume" name="Volume" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>

                    {/* Mutu Beton breakdown */}
                    <Panel title="Distribusi Mutu Beton" subtitle="Volume per mutu dalam periode ini">
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer>
                                <BarChart data={per_mutu} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} horizontal={false} />
                                    <XAxis type="number" tickFormatter={v => v + ' m³'} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="mutu" width={70} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="volume" name="Volume" radius={[0, 6, 6, 0]} maxBarSize={22}>
                                        {per_mutu.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>
                </div>

                {/* Per-customer table */}
                <Panel title="Rekapitulasi per Proyek & Customer" subtitle={`Top 20 proyek berdasarkan volume — ${PERIOD_OPTS.find(o=>o.value===period)?.label ?? period}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-left">
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500">Proyek</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500">Customer</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 text-right">Kiriman</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 text-right">Volume (m³)</th>
                                    <th className="pb-3 text-xs font-semibold text-gray-500 text-right">Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {per_customer.length === 0 && (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Tidak ada data kiriman dalam periode ini</td></tr>
                                )}
                                {per_customer.map((row, i) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-gray-800 max-w-[200px] truncate">{row.project_name}</td>
                                        <td className="py-3 pr-4 text-gray-500 max-w-[160px] truncate">{row.customer_name}</td>
                                        <td className="py-3 pr-4 text-right text-gray-700 tabular-nums">{fmtNum(row.jumlah_kiriman)}</td>
                                        <td className="py-3 pr-4 text-right font-semibold text-indigo-600 tabular-nums">{vol(row.total_volume)}</td>
                                        <td className="py-3 text-right text-gray-700 tabular-nums">{rupiah(row.total_nilai)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>

                {/* Recent shipments */}
                <Panel title="50 Kiriman Terbaru" subtitle="Diurutkan dari yang terbaru">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-left">
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500">Tanggal</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500">Proyek</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500">Customer</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500">Mutu</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 text-right">Volume</th>
                                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 text-right">Nilai</th>
                                    <th className="pb-3 text-xs font-semibold text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recent_shipments.length === 0 && (
                                    <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">Tidak ada kiriman</td></tr>
                                )}
                                {recent_shipments.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-2.5 pr-4 text-gray-500 tabular-nums whitespace-nowrap">{s.date}</td>
                                        <td className="py-2.5 pr-4 font-medium text-gray-800 max-w-[160px] truncate">{s.project_name}</td>
                                        <td className="py-2.5 pr-4 text-gray-500 max-w-[140px] truncate">{s.customer_name}</td>
                                        <td className="py-2.5 pr-4 text-gray-600">{s.mutu}</td>
                                        <td className="py-2.5 pr-4 text-right font-semibold text-indigo-600 tabular-nums">{vol(s.volume)}</td>
                                        <td className="py-2.5 pr-4 text-right text-gray-700 tabular-nums">{rupiah(s.nilai)}</td>
                                        <td className="py-2.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                s.is_billed
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {s.is_billed ? 'Sudah Tagih' : 'Belum Tagih'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            </div>
        </OwnerLayout>
    );
}
