import PageHeader from '@/Components/PageHeader';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Building2, Download, FileText, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

dayjs.locale('id');

const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Index({
    rows = [],
    selectedMonth = dayjs().format('YYYY-MM'),
    selectedMonthLabel = dayjs().format('MMMM YYYY'),
    selectedCompany = null,
}) {
    const finalizedSlipUuids = useMemo(
        () => rows.filter((row) => row.slip?.is_finalized).map((row) => row.slip.uuid),
        [rows],
    );
    const hasAnySlip = finalizedSlipUuids.length > 0;

    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedSlipUuids, setSelectedSlipUuids] = useState([]);
    const [exportSettings, setExportSettings] = useState({
        mode: 'individual',
        metode: 'TF',
        tgl_tf: dayjs(selectedMonth).set('date', 26).format('YYYY-MM-DD'),
        tgl_ttd: dayjs(selectedMonth).set('date', 26).format('YYYY-MM-DD'),
    });
    const selectedSlipSet = useMemo(() => new Set(selectedSlipUuids), [selectedSlipUuids]);
    const selectedCount = selectedSlipUuids.length;
    const allFinalizedSelected = hasAnySlip && selectedCount === finalizedSlipUuids.length;

    useEffect(() => {
        setSelectedSlipUuids((current) => current.filter((uuid) => finalizedSlipUuids.includes(uuid)));
    }, [finalizedSlipUuids]);

    const handleMonthChange = (event) => {
        router.get(
            route('slip-gaji.index'),
            { month: event.target.value },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const toggleSlipSelection = (uuid) => {
        setSelectedSlipUuids((current) => (
            current.includes(uuid)
                ? current.filter((selectedUuid) => selectedUuid !== uuid)
                : [...current, uuid]
        ));
    };

    const toggleAllSelection = () => {
        setSelectedSlipUuids(allFinalizedSelected ? [] : finalizedSlipUuids);
    };

    const handleExportBatch = () => {
        if (selectedCount === 0) {
            return;
        }

        const query = new URLSearchParams();
        query.append('month', selectedMonth);
        query.append('mode', exportSettings.mode);
        selectedSlipUuids.forEach((uuid) => query.append('slips[]', uuid));

        if (exportSettings.mode === 'uniform') {
            query.append('metode', exportSettings.metode);
            query.append('tgl_tf', exportSettings.tgl_tf);
            query.append('tgl_ttd', exportSettings.tgl_ttd);
        }
        
        window.open(`${route('slip-gaji.print-all')}?${query.toString()}`, '_blank');
        setShowExportModal(false);
    };

    return (
        <BendaharaLayout>
            <Head title="Slip Gaji" />

            <div className="space-y-6">
                <PageHeader
                    title="Slip Gaji"
                    actions={(
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route('slip-gaji.companies.index')}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                                <Building2 className="mr-2 h-4 w-4" />
                                Perusahaan
                            </Link>
                            <Link
                                href={route('slip-gaji.employees.index')}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Daftar Pegawai
                            </Link>
                            {hasAnySlip ? (
                                <button
                                    type="button"
                                    onClick={() => setShowExportModal(true)}
                                    disabled={selectedCount === 0}
                                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                        selectedCount > 0
                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                            : 'border-slate-200 bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Terpilih PDF
                                    {selectedCount > 0 && (
                                        <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-black text-indigo-700">
                                            {selectedCount}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Terpilih PDF
                                </button>
                            )}
                        </div>
                    )}
                />

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Perusahaan Aktif</span>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                                {selectedCompany?.name || 'Belum dipilih'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <label htmlFor="month" className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">
                                Bulan
                            </label>
                            <input
                                id="month"
                                type="month"
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-semibold text-slate-500">{selectedMonthLabel}</span>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/90">
                                <tr>
                                    <th className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={allFinalizedSelected}
                                            disabled={!hasAnySlip}
                                            onChange={toggleAllSelection}
                                            aria-label="Pilih semua slip gaji"
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-slate-100"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Nama</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">NIK</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Jabatan</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Status Slip</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Pendapatan</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Potongan</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Bersih</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/70">
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(row.slip?.uuid && selectedSlipSet.has(row.slip.uuid))}
                                                    disabled={!row.slip?.is_finalized}
                                                    onChange={() => toggleSlipSelection(row.slip.uuid)}
                                                    aria-label={`Pilih slip gaji ${row.name}`}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-slate-100"
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{row.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{row.nik || '-'}</td>
                                            <td className="px-6 py-4 text-slate-500">{row.jabatan || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${
                                                        row.slip?.is_finalized
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    {row.slip?.is_finalized ? 'Sudah Diisi' : 'Belum Diisi'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                                                {formatCurrency(row.slip?.total_pendapatan)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-rose-700">
                                                {formatCurrency(row.slip?.total_potongan)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-indigo-700">
                                                {formatCurrency(row.slip?.pendapatan_bersih)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <Link
                                                        href={route('slip-gaji.create', {
                                                            employee: row.uuid,
                                                            month: selectedMonth,
                                                        })}
                                                        className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                                    >
                                                        <FileText className="mr-2 h-3.5 w-3.5" />
                                                        {row.slip ? 'Edit Gaji' : 'Isi Gaji'}
                                                    </Link>

                                                    {row.slip?.is_finalized ? (
                                                        <a
                                                            href={route('slip-gaji.print', row.slip.uuid)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center rounded-xl border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50"
                                                        >
                                                            <Download className="mr-2 h-3.5 w-3.5" />
                                                            PDF
                                                        </a>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-300"
                                                        >
                                                            <Download className="mr-2 h-3.5 w-3.5" />
                                                            PDF
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-16 text-center text-sm italic text-slate-500">
                                            {selectedCompany ? 'Belum ada data pegawai untuk perusahaan ini.' : 'Pilih perusahaan aktif terlebih dahulu.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <Modal show={showExportModal} onClose={() => setShowExportModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-slate-800">Export PDF Terpilih</h2>
                        <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block">
                                Pengaturan Data Cetak
                            </label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="export_mode"
                                        value="individual"
                                        checked={exportSettings.mode === 'individual'}
                                        onChange={(e) => setExportSettings({ ...exportSettings, mode: e.target.value })}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">Sesuai data masing-masing pegawai</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="export_mode"
                                        value="uniform"
                                        checked={exportSettings.mode === 'uniform'}
                                        onChange={(e) => setExportSettings({ ...exportSettings, mode: e.target.value })}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">Jadikan 1 pengaturan untuk semua</span>
                                </label>
                            </div>
                        </div>

                        {exportSettings.mode === 'uniform' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1 block">Metode Pembayaran</label>
                                    <select
                                        value={exportSettings.metode}
                                        onChange={(e) => setExportSettings({ ...exportSettings, metode: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="TF">TRANSFER (TF)</option>
                                        <option value="CASH">TUNAI (CASH)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1 block">Tanggal TF / Cash</label>
                                    <TextInput
                                        type="date"
                                        value={exportSettings.tgl_tf}
                                        onChange={(e) => setExportSettings({ ...exportSettings, tgl_tf: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1 block">Tanggal TTD</label>
                                    <TextInput
                                        type="date"
                                        value={exportSettings.tgl_ttd}
                                        onChange={(e) => setExportSettings({ ...exportSettings, tgl_ttd: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <SecondaryButton onClick={() => setShowExportModal(false)}>Batal</SecondaryButton>
                            <PrimaryButton
                                onClick={handleExportBatch}
                                disabled={selectedCount === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Download className="mr-2 h-4 w-4" /> Export PDF
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
