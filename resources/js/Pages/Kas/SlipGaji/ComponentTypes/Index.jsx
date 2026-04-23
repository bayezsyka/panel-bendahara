import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PageHeader from '@/Components/PageHeader';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const modeMeta = {
    income: {
        title: 'Tipe Pendapatan',
        createLabel: 'Tambah Tipe Pendapatan',
        saveRoute: 'slip-gaji.income-types.store',
        updateRoute: 'slip-gaji.income-types.update',
        deleteRoute: 'slip-gaji.income-types.destroy',
    },
    deduction: {
        title: 'Tipe Potongan',
        createLabel: 'Tambah Tipe Potongan',
        saveRoute: 'slip-gaji.deduction-types.store',
        updateRoute: 'slip-gaji.deduction-types.update',
        deleteRoute: 'slip-gaji.deduction-types.destroy',
    },
};

const initialForm = {
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
};

export default function Index({ mode, types = [] }) {
    const meta = modeMeta[mode] ?? modeMeta.income;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [deletingType, setDeletingType] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm(initialForm);

    const openModal = (type = null) => {
        clearErrors();

        if (type) {
            setEditingType(type);
            setData({
                name: type.name,
                description: type.description ?? '',
                sort_order: type.sort_order ?? 0,
                is_active: Boolean(type.is_active),
            });
        } else {
            setEditingType(null);
            reset();
            setData(initialForm);
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingType(null);
        reset();
        setData(initialForm);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (editingType) {
            put(route(meta.updateRoute, editingType.id), {
                onSuccess: () => closeModal(),
            });

            return;
        }

        post(route(meta.saveRoute), {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = () => {
        if (!deletingType) {
            return;
        }

        destroy(route(meta.deleteRoute, deletingType.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeletingType(null);
            },
        });
    };

    return (
        <BendaharaLayout>
            <Head title={meta.title} />

            <div className="space-y-6">
                <PageHeader
                    title={meta.title}
                    actions={
                        <PrimaryButton onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" />
                            {meta.createLabel}
                        </PrimaryButton>
                    }
                />

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Nama</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Keterangan</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Urutan</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {types.length > 0 ? (
                                    types.map((type) => (
                                        <tr key={type.id} className="hover:bg-slate-50/60">
                                            <td className="px-6 py-4 font-bold text-slate-900">{type.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{type.description || '-'}</td>
                                            <td className="px-6 py-4 text-center font-semibold">{type.sort_order}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${
                                                        type.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {type.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(type)}
                                                        className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                                    >
                                                        <Pencil className="mr-2 h-3.5 w-3.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDeletingType(type);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-sm italic text-slate-500">
                                            Belum ada data.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-900">
                        {editingType ? `Edit ${meta.title}` : meta.createLabel}
                    </h2>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Keterangan" />
                            <TextInput
                                id="description"
                                className="mt-1 block w-full"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="sort_order" value="Urutan" />
                                <TextInput
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.sort_order}
                                    onChange={(event) => setData('sort_order', event.target.value)}
                                />
                                <InputError message={errors.sort_order} className="mt-2" />
                            </div>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={data.is_active}
                                    onChange={(event) => setData('is_active', event.target.checked)}
                                />
                                Aktif
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton onClick={closeModal} type="button">
                                Batal
                            </SecondaryButton>
                            <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-black text-slate-900">Hapus data?</h2>
                    <InputError message={errors.error} className="mt-3" />
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} type="button">
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} type="button" disabled={processing}>
                            {processing ? 'Menghapus...' : 'Hapus'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
