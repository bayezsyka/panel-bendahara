import BendaharaLayout from '@/Layouts/BendaharaLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/PageHeader';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ArrowLeft, Calculator, FileText, Landmark, UserRound } from 'lucide-react';
import { useEffect } from 'react';

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

const getDefaultPeriode = () => `1 - 25 ${dayjs().format('MMMM YYYY')}`;
const getDefaultTtd = () => `Brebes, .................... ${dayjs().add(1, 'month').format('MMMM YYYY')}`;

const buildDefaultForm = () => ({
    user_id: '',
    employee_name: '',
    employee_nik: '',
    employee_position: '',
    status: 'Karyawan Tetap',
    periode: getDefaultPeriode(),
    tanggal_tf_cash: dayjs().format('YYYY-MM-DD'),
    gaji_pokok: '',
    uang_makan: '',
    uang_lembur: '',
    bpjs_kesehatan: '',
    bpjs_ketenagakerjaan: '',
    pph21: '',
    pendapatan_bersih: '0',
    tempat_tanggal_ttd: getDefaultTtd(),
    penerima: '',
    direktur: 'Direktur Utama',
});

const readonlyInputClass =
    'mt-1 block w-full rounded-xl border border-slate-200 bg-slate-100 text-slate-700 shadow-sm';

export default function Create({ daftarPegawai = [], flash = {} }) {
    const initialValues = buildDefaultForm();
    const { data, setData, post, processing, errors, reset } = useForm(initialValues);

    useEffect(() => {
        const totalPendapatan =
            parseNumber(data.gaji_pokok) +
            parseNumber(data.uang_makan) +
            parseNumber(data.uang_lembur);

        const totalPotongan =
            parseNumber(data.bpjs_kesehatan) +
            parseNumber(data.bpjs_ketenagakerjaan) +
            parseNumber(data.pph21);

        const pendapatanBersih = totalPendapatan - totalPotongan;
        setData('pendapatan_bersih', String(pendapatanBersih));
    }, [
        data.gaji_pokok,
        data.uang_makan,
        data.uang_lembur,
        data.bpjs_kesehatan,
        data.bpjs_ketenagakerjaan,
        data.pph21,
        setData,
    ]);

    const handlePegawaiChange = (event) => {
        const selectedId = event.target.value;
        const selectedPegawai = daftarPegawai.find((pegawai) => String(pegawai.id) === selectedId);

        if (!selectedPegawai) {
            setData((currentData) => ({
                ...currentData,
                user_id: '',
                employee_name: '',
                employee_nik: '',
                employee_position: '',
                penerima: '',
            }));

            return;
        }

        setData((currentData) => ({
            ...currentData,
            user_id: selectedId,
            employee_name: selectedPegawai.name ?? '',
            employee_nik: selectedPegawai.nik ?? '',
            employee_position: selectedPegawai.jabatan ?? '',
            penerima: selectedPegawai.name ?? '',
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        post(route('slip-gaji.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const createdSlipGajiId = page?.props?.flash?.created_slip_gaji_id;

                reset();
                setData(buildDefaultForm());

                if (createdSlipGajiId) {
                    window.open(route('slip-gaji.print', createdSlipGajiId), '_blank');
                }
            },
        });
    };

    const totalPendapatan =
        parseNumber(data.gaji_pokok) +
        parseNumber(data.uang_makan) +
        parseNumber(data.uang_lembur);

    const totalPotongan =
        parseNumber(data.bpjs_kesehatan) +
        parseNumber(data.bpjs_ketenagakerjaan) +
        parseNumber(data.pph21);

    return (
        <BendaharaLayout>
            <Head title="Pembuatan Slip Gaji" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-3">
                            <Link
                                href="/"
                                className="inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Beranda
                            </Link>

                            <PageHeader
                                title="Pembuatan Slip Gaji"
                                subtitle="Buat slip gaji, hitung pendapatan bersih otomatis, lalu cetak PDF dalam satu alur."
                            />
                        </div>

                        <div className="hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm lg:block">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">
                                Slip Gaji
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                                Periode default:
                            </p>
                            <p className="text-lg font-black text-slate-900">{getDefaultPeriode()}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-6">
                                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                                                <UserRound className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-slate-900">Informasi Pegawai</h2>
                                                <p className="text-sm text-slate-500">
                                                    Pilih pegawai untuk mengisi nama, NIK, jabatan, dan penerima secara otomatis.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 p-6 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="user_id" value="Pilih Pegawai" />
                                            <select
                                                id="user_id"
                                                value={data.user_id}
                                                onChange={handlePegawaiChange}
                                                className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">Pilih data pegawai</option>
                                                {daftarPegawai.map((pegawai) => (
                                                    <option key={pegawai.id} value={pegawai.id}>
                                                        {pegawai.name} {pegawai.jabatan ? `- ${pegawai.jabatan}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.user_id} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="employee_name" value="Nama Pegawai" />
                                            <TextInput
                                                id="employee_name"
                                                value={data.employee_name}
                                                className={readonlyInputClass}
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="employee_nik" value="NIK" />
                                            <TextInput
                                                id="employee_nik"
                                                value={data.employee_nik}
                                                className={readonlyInputClass}
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="employee_position" value="Jabatan" />
                                            <TextInput
                                                id="employee_position"
                                                value={data.employee_position}
                                                className={readonlyInputClass}
                                                readOnly
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="penerima" value="Penerima" />
                                            <TextInput
                                                id="penerima"
                                                value={data.penerima}
                                                className={readonlyInputClass}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-slate-900">Detail Slip Gaji</h2>
                                                <p className="text-sm text-slate-500">
                                                    Atur status, periode, tanggal pembayaran, dan identitas penandatangan slip.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 p-6 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="status" value="Status" />
                                            <TextInput
                                                id="status"
                                                value={data.status}
                                                onChange={(event) => setData('status', event.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.status} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="periode" value="Periode" />
                                            <TextInput
                                                id="periode"
                                                value={data.periode}
                                                onChange={(event) => setData('periode', event.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.periode} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="tanggal_tf_cash" value="Tanggal TF / Cash" />
                                            <TextInput
                                                id="tanggal_tf_cash"
                                                type="date"
                                                value={data.tanggal_tf_cash}
                                                onChange={(event) => setData('tanggal_tf_cash', event.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.tanggal_tf_cash} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="direktur" value="Direktur" />
                                            <TextInput
                                                id="direktur"
                                                value={data.direktur}
                                                onChange={(event) => setData('direktur', event.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.direktur} className="mt-2" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="tempat_tanggal_ttd" value="Tempat & Tanggal TTD" />
                                            <TextInput
                                                id="tempat_tanggal_ttd"
                                                value={data.tempat_tanggal_ttd}
                                                onChange={(event) => setData('tempat_tanggal_ttd', event.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.tempat_tanggal_ttd} className="mt-2" />
                                        </div>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                                <Landmark className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-slate-900">Komponen Gaji</h2>
                                                <p className="text-sm text-slate-500">
                                                    Isi nominal pendapatan dan potongan. Pendapatan bersih akan dihitung otomatis.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 p-6 lg:grid-cols-2">
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                                            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">
                                                Pendapatan
                                            </h3>

                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <InputLabel htmlFor="gaji_pokok" value="Gaji Pokok" />
                                                    <TextInput
                                                        id="gaji_pokok"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.gaji_pokok}
                                                        onChange={(event) => setData('gaji_pokok', event.target.value)}
                                                        className="mt-1 block w-full"
                                                        required
                                                    />
                                                    <InputError message={errors.gaji_pokok} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor="uang_makan" value="Uang Makan" />
                                                    <TextInput
                                                        id="uang_makan"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.uang_makan}
                                                        onChange={(event) => setData('uang_makan', event.target.value)}
                                                        className="mt-1 block w-full"
                                                    />
                                                    <InputError message={errors.uang_makan} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor="uang_lembur" value="Uang Lembur" />
                                                    <TextInput
                                                        id="uang_lembur"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.uang_lembur}
                                                        onChange={(event) => setData('uang_lembur', event.target.value)}
                                                        className="mt-1 block w-full"
                                                    />
                                                    <InputError message={errors.uang_lembur} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                                            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-rose-700">
                                                Potongan
                                            </h3>

                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <InputLabel htmlFor="bpjs_kesehatan" value="BPJS Kesehatan" />
                                                    <TextInput
                                                        id="bpjs_kesehatan"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.bpjs_kesehatan}
                                                        onChange={(event) => setData('bpjs_kesehatan', event.target.value)}
                                                        className="mt-1 block w-full"
                                                    />
                                                    <InputError message={errors.bpjs_kesehatan} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor="bpjs_ketenagakerjaan" value="BPJS Ketenagakerjaan" />
                                                    <TextInput
                                                        id="bpjs_ketenagakerjaan"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.bpjs_ketenagakerjaan}
                                                        onChange={(event) => setData('bpjs_ketenagakerjaan', event.target.value)}
                                                        className="mt-1 block w-full"
                                                    />
                                                    <InputError message={errors.bpjs_ketenagakerjaan} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor="pph21" value="PPh 21" />
                                                    <TextInput
                                                        id="pph21"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.pph21}
                                                        onChange={(event) => setData('pph21', event.target.value)}
                                                        className="mt-1 block w-full"
                                                    />
                                                    <InputError message={errors.pph21} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="space-y-6">
                                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                                                <Calculator className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-slate-900">Ringkasan Perhitungan</h2>
                                                <p className="text-sm text-slate-500">
                                                    Nilai akan berubah real-time saat komponen gaji diperbarui.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-6">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                                                Total Pendapatan
                                            </p>
                                            <p className="mt-2 text-2xl font-black text-emerald-700">
                                                {formatCurrency(totalPendapatan)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                                                Total Potongan
                                            </p>
                                            <p className="mt-2 text-2xl font-black text-rose-700">
                                                {formatCurrency(totalPotongan)}
                                            </p>
                                        </div>

                                        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-sky-600 px-5 py-5 text-white shadow-lg shadow-indigo-200/60">
                                            <p className="text-xs font-black uppercase tracking-[0.28em] text-indigo-100">
                                                Pendapatan Bersih
                                            </p>
                                            <p className="mt-3 text-3xl font-black">
                                                {formatCurrency(data.pendapatan_bersih)}
                                            </p>
                                            <TextInput
                                                id="pendapatan_bersih"
                                                type="hidden"
                                                value={data.pendapatan_bersih}
                                                readOnly
                                            />
                                        </div>

                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                                            <p className="font-semibold text-slate-700">Formula</p>
                                            <p className="mt-2 leading-6">
                                                ({formatCurrency(data.gaji_pokok)} + {formatCurrency(data.uang_makan)} + {formatCurrency(data.uang_lembur)}) - ({formatCurrency(data.bpjs_kesehatan)} + {formatCurrency(data.bpjs_ketenagakerjaan)} + {formatCurrency(data.pph21)})
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                                        Catatan
                                    </p>
                                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                                        <li>Nama, NIK, Jabatan, dan Penerima diambil dari data pegawai yang dipilih.</li>
                                        <li>Tempat & tanggal TTD default mengikuti format cetak manual yang diminta.</li>
                                        <li>Setelah simpan berhasil, slip PDF akan dibuka otomatis di tab baru.</li>
                                    </ul>
                                </section>
                            </aside>
                        </div>

                        <div className="flex flex-col-reverse justify-end gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    reset();
                                    setData(buildDefaultForm());
                                }}
                            >
                                Reset Form
                            </SecondaryButton>

                            <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {processing ? 'Menyimpan...' : 'Simpan & Cetak Slip Gaji'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </BendaharaLayout>
    );
}
