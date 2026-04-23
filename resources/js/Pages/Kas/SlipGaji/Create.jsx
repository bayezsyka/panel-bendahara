import InputError from '@/Components/InputError';
import PageHeader from '@/Components/PageHeader';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ArrowLeft, Building2, Download, Users } from 'lucide-react';

dayjs.locale('id');

const parseNumber = (value) => {
    const number = Number(value);
    return Number.isNaN(number) ? 0 : number;
};

const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parseNumber(value));

const cellInputClass =
    'w-full border-0 bg-transparent px-0 py-0 text-sm text-slate-800 focus:border-0 focus:ring-0';

const sheetSectionClass = 'bg-slate-100 text-slate-900';
const sheetLabelClass = 'bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500';
const sheetValueClass = 'px-4 py-3 text-sm text-slate-800';
const sheetAmountClass = 'px-4 py-2 text-right text-sm font-semibold text-slate-800';

export default function Create({
    daftarPegawai = [],
    selectedCompany = null,
    selectedMonth = dayjs().format('YYYY-MM'),
    selectedMonthLabel = dayjs().format('MMMM YYYY'),
    availableStatuses = [],
    initialForm = null,
    existingSlip = null,
}) {
    const fallbackForm = initialForm ?? {
        employee_id: '',
        period_month: selectedMonth,
        tanggal_tf_cash: dayjs().format('YYYY-MM-DD'),
        status: '',
        metode_pembayaran: 'TF',
        income_items: [],
        deduction_items: [],
        tanggal_ttd: dayjs().format('YYYY-MM-DD'),
    };

    const { data, setData, post, processing, errors } = useForm(fallbackForm);

    const selectedPegawai = daftarPegawai.find((pegawai) => String(pegawai.uuid) === String(data.employee_id));
    const componentRowCount = Math.max(data.income_items.length, data.deduction_items.length);
    const totalPendapatan = data.income_items.reduce((total, item) => total + parseNumber(item.amount), 0);
    const totalPotongan = data.deduction_items.reduce((total, item) => total + parseNumber(item.amount), 0);
    const pendapatanBersih = totalPendapatan - totalPotongan;

    const updateItemAmount = (group, index, value) => {
        setData(
            group,
            data[group].map((item, itemIndex) => (
                itemIndex === index
                    ? { ...item, amount: value }
                    : item
            )),
        );
    };

    const handleReset = () => {
        if (existingSlip?.uuid) {
            router.patch(route('slip-gaji.reset', existingSlip.uuid), {}, {
                preserveScroll: true,
            });

            return;
        }

        setData(fallbackForm);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        post(route('slip-gaji.store'), {
            preserveScroll: true,
        });
    };

    const isDisabled =
        processing
        || !selectedCompany
        || !selectedPegawai
        || daftarPegawai.length === 0
        || data.income_items.length === 0
        || data.deduction_items.length === 0;
    const canPrint = Boolean(existingSlip?.uuid) && Boolean(existingSlip?.is_finalized) && !processing;

    return (
        <BendaharaLayout>
            <Head title={existingSlip ? 'Edit Slip Gaji' : 'Isi Slip Gaji'} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <PageHeader
                        title={existingSlip ? 'Edit Slip Gaji' : 'Isi Slip Gaji'}
                        meta={`Periode ${selectedMonthLabel}`}
                    />

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route('slip-gaji.index', { month: selectedMonth })}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
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
                        {existingSlip?.is_finalized && (
                            <a
                                href={route('slip-gaji.print', existingSlip.uuid)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                            </a>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] table-fixed border-collapse">
                                <colgroup>
                                    <col className="w-[20%]" />
                                    <col className="w-[30%]" />
                                    <col className="w-[20%]" />
                                    <col className="w-[30%]" />
                                </colgroup>

                                <tbody className="[&_td]:border [&_td]:border-slate-200">
                                    <tr className="bg-slate-950 text-white">
                                        <td className="px-4 py-4 text-sm font-black uppercase tracking-[0.28em]" colSpan="4">
                                            Detail Slip Gaji
                                        </td>
                                    </tr>

                                    <tr className="bg-indigo-50">
                                        <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600">
                                            Perusahaan Aktif
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-indigo-700">
                                            {selectedCompany?.name || 'Belum dipilih'}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600">
                                            Bulan
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-indigo-700">
                                            {selectedMonthLabel}
                                        </td>
                                    </tr>

                                    <tr className={sheetSectionClass}>
                                        <td className="px-4 py-3 text-sm font-black uppercase tracking-[0.24em]" colSpan="4">
                                            Data Pegawai Dan Slip
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={sheetLabelClass}>Pegawai Terpilih</td>
                                        <td className={sheetValueClass}>
                                            {selectedPegawai
                                                ? `${selectedPegawai.name}${selectedPegawai.jabatan ? ` - ${selectedPegawai.jabatan}` : ''}`
                                                : 'Belum ada pegawai dipilih dari tabel utama'}
                                        </td>
                                        <td className={sheetLabelClass}>Status / Jabatan</td>
                                        <td className={sheetValueClass}>
                                            <TextInput
                                                id="status"
                                                type="text"
                                                list="status-options"
                                                value={data.status}
                                                onChange={(event) => setData('status', event.target.value)}
                                                className={cellInputClass}
                                                required
                                                disabled={!selectedCompany || !selectedPegawai}
                                                placeholder="Contoh: Karyawan Tetap"
                                            />
                                            <datalist id="status-options">
                                                {availableStatuses.map((status) => (
                                                    <option key={status} value={status} />
                                                ))}
                                            </datalist>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={sheetLabelClass}>Nama</td>
                                        <td className={sheetValueClass}>{selectedPegawai?.name || '-'}</td>
                                        <td className={sheetLabelClass}>Metode Pembayaran</td>
                                        <td className={sheetValueClass}>
                                            <select
                                                id="metode_pembayaran"
                                                value={data.metode_pembayaran}
                                                onChange={(event) => setData('metode_pembayaran', event.target.value)}
                                                className={cellInputClass}
                                                required
                                                disabled={!selectedCompany || !selectedPegawai}
                                            >
                                                <option value="TF">TRANSFER (TF)</option>
                                                <option value="CASH">TUNAI (CASH)</option>
                                            </select>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={sheetLabelClass}>NIK</td>
                                        <td className={sheetValueClass}>{selectedPegawai?.nik || '-'}</td>
                                        <td className={sheetLabelClass}>Tanggal TF / Cash</td>
                                        <td className={sheetValueClass}>
                                            <TextInput
                                                id="tanggal_tf_cash"
                                                type="date"
                                                value={data.tanggal_tf_cash}
                                                onChange={(event) => setData('tanggal_tf_cash', event.target.value)}
                                                className={cellInputClass}
                                                required
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={sheetLabelClass}>Jabatan</td>
                                        <td className={sheetValueClass}>{selectedPegawai?.jabatan || '-'}</td>
                                        <td className={sheetLabelClass}>Direktur</td>
                                        <td className={sheetValueClass}>
                                            {selectedCompany?.direktur || 'Direktur Utama'}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={sheetLabelClass}>Perusahaan</td>
                                        <td className={sheetValueClass}>{selectedCompany?.name || '-'}</td>
                                        <td className={sheetLabelClass}>Tanggal TTD (Brebes)</td>
                                        <td className={sheetValueClass}>
                                            <TextInput
                                                id="tanggal_ttd"
                                                type="date"
                                                value={data.tanggal_ttd}
                                                onChange={(event) => setData('tanggal_ttd', event.target.value)}
                                                className={cellInputClass}
                                                required
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={sheetLabelClass}>Periode Bulan</td>
                                        <td className={sheetValueClass}>{selectedMonthLabel}</td>
                                        <td className={sheetLabelClass}>Pendapatan Bersih</td>
                                        <td className={`${sheetValueClass} text-lg font-black text-indigo-700`}>
                                            {formatCurrency(pendapatanBersih)}
                                        </td>
                                    </tr>

                                    <tr className={sheetSectionClass}>
                                        <td className="px-4 py-3 text-sm font-black uppercase tracking-[0.24em]" colSpan="2">
                                            Pendapatan
                                        </td>
                                        <td className="px-4 py-3 text-sm font-black uppercase tracking-[0.24em]" colSpan="2">
                                            Potongan
                                        </td>
                                    </tr>

                                    <tr className="bg-slate-50">
                                        <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                            Komponen
                                        </td>
                                        <td className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                            Nominal
                                        </td>
                                        <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                            Komponen
                                        </td>
                                        <td className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                            Nominal
                                        </td>
                                    </tr>

                                    {Array.from({ length: componentRowCount }).map((_, index) => {
                                        const incomeItem = data.income_items[index] ?? null;
                                        const deductionItem = data.deduction_items[index] ?? null;

                                        return (
                                            <tr key={`component-row-${index}`}>
                                                <td className={sheetValueClass}>{incomeItem?.name || '-'}</td>
                                                <td className={sheetAmountClass}>
                                                    {incomeItem ? (
                                                        <TextInput
                                                            id={`income_amount_${incomeItem.salary_component_type_id}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className={`${cellInputClass} text-right font-semibold`}
                                                            value={incomeItem.amount}
                                                            onChange={(event) => updateItemAmount('income_items', index, event.target.value)}
                                                        />
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                                <td className={sheetValueClass}>{deductionItem?.name || '-'}</td>
                                                <td className={sheetAmountClass}>
                                                    {deductionItem ? (
                                                        <TextInput
                                                            id={`deduction_amount_${deductionItem.salary_component_type_id}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className={`${cellInputClass} text-right font-semibold`}
                                                            value={deductionItem.amount}
                                                            onChange={(event) => updateItemAmount('deduction_items', index, event.target.value)}
                                                        />
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="bg-emerald-50">
                                        <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                                            Total Pendapatan
                                        </td>
                                        <td className="px-4 py-3 text-right text-base font-black text-emerald-700">
                                            {formatCurrency(totalPendapatan)}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700">
                                            Total Potongan
                                        </td>
                                        <td className="px-4 py-3 text-right text-base font-black text-rose-700">
                                            {formatCurrency(totalPotongan)}
                                        </td>
                                    </tr>

                                    <tr className="bg-indigo-600 text-white">
                                        <td className="px-4 py-4 text-sm font-black uppercase tracking-[0.24em]" colSpan="2">
                                            Pendapatan Bersih
                                        </td>
                                        <td className="px-4 py-4 text-right text-2xl font-black" colSpan="2">
                                            {formatCurrency(pendapatanBersih)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-2 border-t border-slate-200 px-4 py-3">
                            <InputError message={errors.employee_id} />
                            <InputError message={errors.period_month} />
                            <InputError message={errors.tanggal_tf_cash} />
                            <InputError message={errors.status} />
                            <InputError message={errors.metode_pembayaran} />
                            <InputError message={errors.tanggal_ttd} />
                            <InputError message={errors.income_items || errors.deduction_items} />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse justify-end gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                        <SecondaryButton type="button" onClick={handleReset}>
                            Reset
                        </SecondaryButton>

                        <SecondaryButton
                            type="button"
                            onClick={() => window.open(route('slip-gaji.print', existingSlip.uuid), '_blank')}
                            disabled={!canPrint}
                        >
                            Cetak
                        </SecondaryButton>

                        <PrimaryButton
                            type="submit"
                            disabled={isDisabled}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {processing ? 'Menyimpan...' : existingSlip ? 'Update' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </BendaharaLayout>
    );
}
