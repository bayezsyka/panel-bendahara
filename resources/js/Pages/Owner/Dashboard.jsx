import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';
import OwnerLayout from '@/Layouts/OwnerLayout';
import PageHeader from '@/Components/PageHeader';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rupiah = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0);
const rupiahCompact = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
    return String(v);
};
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
const fmtBulan = (ym) => { if (!ym) return ''; const [y, m] = ym.split('-'); return `${MONTHS_ID[parseInt(m) - 1]} '${y.slice(2)}`; };
const fmtNum = (n) => new Intl.NumberFormat('id-ID').format(n ?? 0);

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#14b8a6'];

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const RupiahTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border-none bg-white dark:bg-gray-900 p-3 shadow-lg text-xs min-w-[160px] border border-gray-100 dark:border-gray-800">
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1.5">{fmtBulan(label) || label}</p>
            {payload.map((e, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: e.color }} />
                        {e.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{rupiah(e.value)}</span>
                </div>
            ))}
        </div>
    );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, bg, ibg, ic, icon, linkTo }) => {
    const inner = (
        <div className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br ${bg} p-5 shadow-sm h-full transition-all hover:shadow-md`}>
            <div className={`w-9 h-9 rounded-lg ${ibg} ${ic} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums mt-0.5">{value}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
            {linkTo && (
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mt-2 group-hover:translate-x-1 transition-transform">Lihat detail →</p>
            )}
        </div>
    );
    if (linkTo) return <Link href={route(linkTo)} className="block h-full group">{inner}</Link>;
    return inner;
};

// ─── Section Panel ────────────────────────────────────────────────────────────
const Panel = ({ title, subtitle, children, action }) => (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {(title || subtitle) && (
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/20">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard({ metrics, projectSpending, cashflowTrend }) {
    const { auth } = usePage().props;
    const { total_kas, piutang_belum_lunas, pengeluaran_proyek_bulan_ini, snapshot, generated_at } = metrics;

    const bulanIni = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    return (
        <OwnerLayout
            header={
                <PageHeader
                    title="Dashboard Ringkasan"
                />
            }
        >
            <Head title="Owner Dashboard" />

            <div className="space-y-6">

                {/* ── KPI Row — each card links to its panel ── */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <KpiCard
                        title="Total Kas"
                        value={rupiah(total_kas.total)}
                        sub={`Besar ${rupiah(total_kas.kas_besar)} · Kecil ${rupiah(total_kas.kas_kecil)}`}
                        bg="from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-900" ibg="bg-emerald-100 dark:bg-emerald-900/40" ic="text-emerald-600 dark:text-emerald-400"
                        linkTo="owner.kas"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                    />
                    <KpiCard
                        title="Piutang Belum Lunas"
                        value={rupiah(piutang_belum_lunas.total)}
                        sub={`${fmtNum(piutang_belum_lunas.jumlah_proyek)} proyek`}
                        bg="from-red-50 dark:from-red-900/20 to-white dark:to-gray-900" ibg="bg-red-100 dark:bg-red-900/40" ic="text-red-600 dark:text-red-400"
                        linkTo="owner.piutang"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <KpiCard
                        title={`Pengeluaran ${pengeluaran_proyek_bulan_ini.periode}`}
                        value={rupiah(pengeluaran_proyek_bulan_ini.total)}
                        sub={`${fmtNum(pengeluaran_proyek_bulan_ini.jumlah_transaksi)} transaksi`}
                        bg="from-amber-50 dark:from-amber-900/20 to-white dark:to-gray-900" ibg="bg-amber-100 dark:bg-amber-900/40" ic="text-amber-600 dark:text-amber-400"
                        linkTo="owner.proyek"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    />
                    <KpiCard
                        title="Proyek Aktif"
                        value={fmtNum(snapshot.total_proyek_aktif)}
                        sub={`${fmtNum(snapshot.pengiriman_bulan_ini)} kiriman bulan ini`}
                        bg="from-blue-50 dark:from-blue-900/20 to-white dark:to-gray-900" ibg="bg-blue-100 dark:bg-blue-900/40" ic="text-blue-600 dark:text-blue-400"
                        linkTo="owner.proyek"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>}
                    />
                </div>

                {/* ── Charts ── */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                    {/* Cashflow */}
                    <Panel
                        title="Tren Arus Kas"
                        subtitle="Kas masuk vs keluar — 6 bulan terakhir"
                        action={<Link href={route('owner.kas')} className="text-xs text-indigo-500 dark:text-indigo-400 font-medium hover:underline">Lihat detail →</Link>}
                    >
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer>
                                <LineChart data={cashflowTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                                    <XAxis dataKey="bulan_key" tickFormatter={fmtBulan} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={rupiahCompact} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                                    <Tooltip content={<RupiahTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 12 }} formatter={v => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
                                    <Line type="monotone" dataKey="kas_masuk" name="Kas Masuk" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="kas_keluar" name="Kas Keluar" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>

                    {/* Project spending */}
                    <Panel
                        title="Pengeluaran per Proyek"
                        subtitle="Top 5 proyek berdasarkan total pengeluaran"
                        action={<Link href={route('owner.proyek')} className="text-xs text-indigo-500 dark:text-indigo-400 font-medium hover:underline">Lihat detail →</Link>}
                    >
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer>
                                <BarChart data={projectSpending} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} horizontal={false} />
                                    <XAxis type="number" tickFormatter={rupiahCompact} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v.length > 14 ? v.slice(0, 13) + '…' : v} />
                                    <Tooltip content={<RupiahTooltip />} />
                                    <Bar dataKey="total_pengeluaran" name="Pengeluaran" radius={[0, 6, 6, 0]} maxBarSize={26}>
                                        {projectSpending.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>
                </div>

                {/* ── Quick-access snapshot row ── */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Volume Beton Bulan Ini', value: `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(snapshot.volume_beton_bulan_ini_m3)} m³`, color: 'text-indigo-600 dark:text-indigo-400' },
                        { label: 'Pengeluaran Kas Bulan Ini', value: rupiah(snapshot.pengeluaran_kas_bulan_ini), color: 'text-red-600 dark:text-red-400' },
                        { label: 'Kas Besar', value: rupiah(total_kas.kas_besar), color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Kas Kecil', value: rupiah(total_kas.kas_kecil), color: 'text-teal-600 dark:text-teal-400' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                            <p className={`text-base font-bold tabular-nums mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Quick links to panels ── */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Kas Harian', sub: 'Transaksi dengan filter tanggal', icon: 'kas', to: 'owner.kas' },
                        { label: 'Proyek Konstruksi', sub: 'Pengeluaran & tren bulanan', icon: 'proyek', to: 'owner.proyek' },
                        { label: 'Piutang', sub: 'Status tagihan per customer', icon: 'piutang', to: 'owner.piutang' },
                        { label: 'Jejak Audit', sub: 'Aktivitas sistem selengkapnya', icon: 'audit', to: 'owner.audit-log' },
                    ].map(q => (
                        <Link key={q.to} href={route(q.to)}
                            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition-all group">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{q.label}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{q.sub}</p>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mt-3">Buka →</p>
                        </Link>
                    ))}
                </div>
            </div>
        </OwnerLayout>
    );
}
