import React, { useState, useEffect } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

export default function Edit({ project, customers, concreteGrades }) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: project.customer_id,
        name: project.name,
        code: project.code || '',
        sub_contractor: project.sub_contractor || '',
        location: project.location || '',
        contact_person: project.contact_person || '',
        work_type: project.work_type || 'Cor',
        default_concrete_grade_id: project.default_concrete_grade_id || '',
    });

    const [useCustomerName, setUseCustomerName] = useState(false);

    useEffect(() => {
        if (useCustomerName && data.customer_id) {
            const customer = customers.find(c => c.id === parseInt(data.customer_id));
            if (customer) {
                setData('sub_contractor', customer.name);
            }
        }
    }, [useCustomerName, data.customer_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('delivery.projects.update', project.id));
    };

    return (
        <BendaharaLayout>
            <Head title={`Edit Proyek: ${project.name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link 
                        href={route('delivery.projects.show', project.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1 mb-2 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali ke Detail
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Proyek</h2>
                    <p className="text-sm text-gray-500 mt-1">Perbarui informasi proyek pengiriman beton</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    {/* Customer Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="customer_id" value="Pilih Customer" />
                            <select
                                id="customer_id"
                                className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm bg-gray-50"
                                value={data.customer_id}
                                onChange={e => setData('customer_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Customer --</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.customer_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="name" value="Nama Proyek" />
                            <TextInput
                                id="name"
                                type="text"
                                className="w-full mt-1"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Contoh: Pembangunan Ruko ABC"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                    </div>

                    <div className="border-t border-gray-50 pt-4 mt-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Teknis & Lokasi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="sub_contractor" value="Penerima / Sub-Contractor" />
                                <div className="mt-1 flex flex-col gap-2">
                                    <TextInput
                                        id="sub_contractor"
                                        type="text"
                                        className="w-full"
                                        value={data.sub_contractor}
                                        onChange={e => {
                                            setData('sub_contractor', e.target.value);
                                            setUseCustomerName(false);
                                        }}
                                        placeholder="Nama Sub-Con (Opsional)"
                                        disabled={useCustomerName && data.customer_id !== ''}
                                    />
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            checked={useCustomerName}
                                            onChange={e => setUseCustomerName(e.target.checked)}
                                            disabled={!data.customer_id}
                                        />
                                        <span className="text-xs text-gray-600 font-medium">Gunakan Nama Customer</span>
                                    </label>
                                </div>
                                <InputError message={errors.sub_contractor} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="contact_person" value="Kontak Lapangan / PIC" />
                                <TextInput
                                    id="contact_person"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.contact_person}
                                    onChange={e => setData('contact_person', e.target.value)}
                                    placeholder="Nama & No. HP Lapangan"
                                />
                                <InputError message={errors.contact_person} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <InputLabel htmlFor="location" value="Alamat Proyek / Lokasi Cor" />
                            <textarea
                                id="location"
                                className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                placeholder="Alamat lengkap proyek"
                                rows="3"
                            ></textarea>
                            <InputError message={errors.location} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="work_type" value="Jenis Pekerjaan" />
                            <TextInput
                                id="work_type"
                                type="text"
                                className="w-full mt-1"
                                value={data.work_type}
                                onChange={e => setData('work_type', e.target.value)}
                                placeholder="Contoh: Cor, Rigid, Sloof, dll"
                            />
                            <InputError message={errors.work_type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="default_concrete_grade_id" value="Default Mutu Beton" />
                            <select
                                id="default_concrete_grade_id"
                                className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.default_concrete_grade_id}
                                onChange={e => setData('default_concrete_grade_id', e.target.value)}
                            >
                                <option value="">-- Pilih Mutu --</option>
                                {concreteGrades.map(grade => (
                                    <option key={grade.id} value={grade.id}>{grade.code}</option>
                                ))}
                            </select>
                            <InputError message={errors.default_concrete_grade_id} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Link 
                            href={route('delivery.projects.show', project.id)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Batal
                        </Link>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </BendaharaLayout>
    );
}
