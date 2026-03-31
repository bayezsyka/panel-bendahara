import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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

// ─── Shared Components ─────────────────────────────────────────────────────────
const RupiahTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-3 text-xs">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{fmtBulan(label)}</p>
            {payload.map((e, i) => (
                <div key={i} className="flex justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><span className="w-2 h-2 rounded-full inline-block" style={{ background: e.color }} />{e.name}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{rupiah(e.value)}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Unified Search + Dropdown Filter Bar ──────────────────────────────────────
const FilterBar = ({ search, setSearch, projectId, setProjectId, status, setStatus, allProjects, pdfHref, pdfLabel }) => {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
                {/* Text search */}
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cari Proyek / Customer</label>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Ketik nama proyek atau customer..."
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {search && (
                            <button onClick={() => setSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Dropdown exact project */}
                <div className="min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pilih Proyek Spesifik</label>
                    <select value={projectId} onChange={e => setProjectId(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">Semua Proyek</option>
                        {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {/* Status filter (only for piutang) */}
                {setStatus && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="all">Semua</option>
                            <option value="unpaid">Belum Lunas</option>
                            <option value="paid">Lunas</option>
                        </select>
                    </div>
                )}

                {/* PDF download — scoped to current project if selected */}
                {pdfHref && (
                    <a href={projectId ? `${pdfHref}${pdfHref.includes('?') ? '&' : '?'}project_id=${projectId}` : pdfHref}
                        target="_blank" rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        {projectId ? `PDF — ${allProjects.find(p=>p.id==projectId)?.name ?? 'Proyek'}` : (pdfLabel || 'Unduh PDF')}
                    </a>
                )}
            </div>
        </div>
    );
};

// ─── PIUTANG ──────────────────────────────────────────────────────────────────
export default function Piutang({ projects, recentPayments, paymentTrend, allProjects, summary, filters }) {
    const [search,    setSearch]    = useState(filters.search ?? '');
    const [projectId, setProjectId] = useState(filters.project_id ?? '');
    const [status,    setStatus]    = useState(filters.status ?? 'unpaid');

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('owner.piutang'), {
                search:     search || undefined,
                project_id: projectId || undefined,
                status,
            }, { 
                preserveState: true,
                replace: true,
                preserveScroll: true
            });
        }, search !== (filters.search ?? '') ? 300 : 0);

        return () => clearTimeout(timeout);
    }, [search, projectId, status]);

    const pctLunas = summary.grand_tagihan > 0
        ? Math.round((summary.grand_bayar / summary.grand_tagihan) * 100)
        : 0;

    const selectedProject = allProjects.find(p => p.id == projectId);
    const isSearching = !!search && !projectId;

    return (
        <OwnerLayout header={<PageHeader title="Piutang & Tagihan" />}>
            <Head title="Piutang — Owner" />

            <div className="space-y-6">
                {/* KPI */}
                {!isSearching && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                        {[
                            { label: 'Total Tagihan',       value: rupiah(summary.grand_tagihan), cls: 'text-gray-900 dark:text-gray-100',    bg: 'from-gray-50 dark:from-gray-800 to-white dark:to-gray-900'    },
                            { label: 'Total Sudah Dibayar', value: rupiah(summary.grand_bayar),   cls: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-900'  },
                            { label: 'Sisa Piutang',        value: rupiah(summary.grand_sisa),    cls: 'text-red-600 dark:text-red-400',     bg: 'from-red-50 dark:from-red-900/20 to-white dark:to-gray-900'      },
                            { label: 'Proyek Belum Lunas',  value: summary.count_unpaid,          cls: 'text-orange-600 dark:text-orange-400',  bg: 'from-orange-50 dark:from-orange-900/20 to-white dark:to-gray-900'   },
                            { label: 'Proyek Lunas',        value: summary.count_paid,            cls: 'text-indigo-600 dark:text-indigo-400',  bg: 'from-indigo-50 dark:from-indigo-900/20 to-white dark:to-gray-900'   },
                        ].map(k => (
                            <div key={k.label} className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br ${k.bg} p-5 shadow-sm`}>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{k.label}</p>
                                <p className={`text-lg font-bold tabular-nums mt-1 ${k.cls}`}>{k.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                {!isSearching && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Progress Pelunasan {selectedProject ? `— ${selectedProject.name}` : 'Keseluruhan'}
                            </p>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{pctLunas}%</p>
                        </div>
                        <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pctLunas}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                            <span>Dibayar: {rupiah(summary.grand_bayar)}</span>
                            <span>Sisa: {rupiah(summary.grand_sisa)}</span>
                        </div>
                    </div>
                )}

                {/* Filter Bar */}
                <FilterBar
                    search={search} 
                    setSearch={(val) => { setSearch(val); setProjectId(''); }}
                    projectId={projectId} 
                    setProjectId={(val) => { setProjectId(val); setSearch(''); }}
                    status={status} setStatus={setStatus}
                    allProjects={allProjects}
                    pdfHref={route('owner.reports.laporan-piutang')}
                    pdfLabel="Unduh PDF Piutang"
                />

                {/* Payment trend chart */}
                {!isSearching && paymentTrend.length > 0 && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Tren Penerimaan Pembayaran (6 Bulan)</h3>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer>
                                <BarChart data={paymentTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} vertical={false} />
                                    <XAxis dataKey="bulan" tickFormatter={fmtBulan} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={rupiahCompact} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                                    <Tooltip content={<RupiahTooltip />} />
                                    <Bar dataKey="total" name="Pembayaran" fill="#22c55e" radius={[4,4,0,0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Per-project table */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {isSearching ? `Hasil Pencarian: "${search}"` : 'Status Piutang per Proyek'}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isSearching ? `Ditemukan ${projects.length} proyek. Pilih satu untuk melihat detail.` : `${projects.length} proyek`}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Proyek</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Total Tagihan</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Dibayar</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Sisa</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Lunas</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {projects.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400"> {isSearching ? 'Proyek tidak ditemukan.' : 'Tidak ada data.'}</td></tr>
                                ) : projects.map(p => (
                                    <tr key={p.id} 
                                        onClick={() => { setProjectId(p.id); setSearch(''); }}
                                        className={`group cursor-pointer transition-colors ${projectId == p.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                        <td className={`px-6 py-3 font-medium max-w-[180px] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${projectId == p.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-200'}`}>{p.project_name}</td>
                                        <td className="px-6 py-3 text-gray-600 dark:text-gray-400 max-w-[140px] truncate">{p.customer_name}</td>
                                        <td className="px-6 py-3 text-right tabular-nums text-gray-900 dark:text-gray-100">{rupiah(p.total_tagihan)}</td>
                                        <td className="px-6 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{rupiah(p.total_bayar)}</td>
                                        <td className="px-6 py-3 text-right tabular-nums font-semibold text-red-600 dark:text-red-400">{p.sisa_piutang > 0 ? rupiah(p.sisa_piutang) : '—'}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden min-w-[60px]">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.pct_lunas}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{p.pct_lunas}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                                {p.status === 'paid' ? 'Lunas' : 'Belum'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent payments */}
                {!isSearching && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                        <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Riwayat Pembayaran</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{recentPayments.length} terakhir</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Tanggal</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Proyek</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Catatan</th>
                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recentPayments.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Belum ada data pembayaran.</td></tr>
                                    ) : recentPayments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{p.date}</td>
                                            <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-[160px] truncate">{p.project}</td>
                                            <td className="px-6 py-3 text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{p.customer}</td>
                                            <td className="px-6 py-3 text-gray-400 dark:text-gray-500 max-w-[180px] truncate">{p.note}</td>
                                            <td className="px-6 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{rupiah(p.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </OwnerLayout>
    );
}
