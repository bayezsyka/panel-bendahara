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

const initialForm = {
    name: '',
    direktur: '',
    description: '',
    is_active: true,
};

export default function Index({ companies = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [deletingCompany, setDeletingCompany] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm(initialForm);

    const openModal = (company = null) => {
        clearErrors();

        if (company) {
            setEditingCompany(company);
            setData({
                name: company.name,
                direktur: company.direktur ?? '',
                description: company.description ?? '',
                is_active: Boolean(company.is_active),
            });
        } else {
            setEditingCompany(null);
            reset();
            setData(initialForm);
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
        reset();
        setData(initialForm);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (editingCompany) {
            put(route('slip-gaji.companies.update', editingCompany.id), {
                onSuccess: () => closeModal(),
            });

            return;
        }

        post(route('slip-gaji.companies.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = () => {
        if (!deletingCompany) {
            return;
        }

        destroy(route('slip-gaji.companies.destroy', deletingCompany.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeletingCompany(null);
            },
        });
    };

    return (
        <BendaharaLayout>
            <Head title="Perusahaan" />

            <div className="space-y-6">
                <PageHeader
                    title="Perusahaan"
                    actions={
                        <PrimaryButton onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Perusahaan
                        </PrimaryButton>
                    }
                />

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Nama</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Direktur</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Keterangan</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Pegawai</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {companies.length > 0 ? (
                                    companies.map((company) => (
                                        <tr key={company.id} className="hover:bg-slate-50/60">
                                            <td className="px-6 py-4 font-bold text-slate-900">{company.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{company.direktur || '-'}</td>
                                            <td className="px-6 py-4 text-slate-500">{company.description || '-'}</td>
                                            <td className="px-6 py-4 text-center font-semibold">{company.employees_count ?? 0}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${
                                                        company.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {company.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(company)}
                                                        className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                                    >
                                                        <Pencil className="mr-2 h-3.5 w-3.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDeletingCompany(company);
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
                                        <td colSpan="6" className="px-6 py-16 text-center text-sm italic text-slate-500">
                                            Belum ada perusahaan.
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
                        {editingCompany ? 'Edit Perusahaan' : 'Tambah Perusahaan'}
                    </h2>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Perusahaan" />
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
                            <InputLabel htmlFor="direktur" value="Direktur Utama" />
                            <TextInput
                                id="direktur"
                                className="mt-1 block w-full"
                                value={data.direktur}
                                onChange={(event) => setData('direktur', event.target.value)}
                            />
                            <InputError message={errors.direktur} className="mt-2" />
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

                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                checked={data.is_active}
                                onChange={(event) => setData('is_active', event.target.checked)}
                            />
                            Tampilkan di dropdown
                        </label>

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
                    <h2 className="text-lg font-black text-slate-900">Hapus perusahaan?</h2>
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
