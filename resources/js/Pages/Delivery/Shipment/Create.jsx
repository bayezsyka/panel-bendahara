import React, { useState, useEffect } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

export default function Create({ projects, concreteGrades, trucks, selectedProjectId, defaultValues }) {
    const { data, setData, post, processing, errors } = useForm({
        delivery_project_id: selectedProjectId || '',
        date: new Date().toISOString().split('T')[0],
        docket_number: '',
        rit_number: '',
        concrete_grade_id: defaultValues?.concrete_grade_id || '',
        delivery_truck_id: '',
        slump: '12 +/- 2',
        volume: '',
        vehicle_number: '',
        driver_name: '',
        price_per_m3: defaultValues?.price_per_m3 || 0,
        total_price: 0,
        notes: '',
    });

    useEffect(() => {
        const total = parseFloat(data.volume || 0) * parseFloat(data.price_per_m3 || 0);
        setData('total_price', total);
    }, [data.volume, data.price_per_m3]);

    const handleProjectChange = (projectId) => {
        setData('delivery_project_id', projectId);
        const project = projects.find(p => p.id === parseInt(projectId));
        if (project && project.default_concrete_grade_id) {
            setData('concrete_grade_id', project.default_concrete_grade_id);
            const grade = concreteGrades.find(g => g.id === project.default_concrete_grade_id);
            if (grade) {
                setData('price_per_m3', grade.price);
            }
        }
    };

    const handleGradeChange = (gradeId) => {
        setData('concrete_grade_id', gradeId);
        const grade = concreteGrades.find(g => g.id === parseInt(gradeId));
        if (grade) {
            setData('price_per_m3', grade.price);
        }
    };

    const handleTruckChange = (truckId) => {
        const truck = trucks?.find(t => t.id === parseInt(truckId));
        if (truck) {
            setData(data => ({
                ...data,
                delivery_truck_id: truck.id,
                vehicle_number: truck.vehicle_number,
                driver_name: truck.driver_name || ''
            }));
        } else {
            setData(data => ({
                ...data,
                delivery_truck_id: '',
                // Keep existing values or clear? Let's just update ID
            })); 
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('delivery.shipments.store'));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <BendaharaLayout>
            <Head title="Catat Pengiriman Baru" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link 
                        href={data.delivery_project_id ? route('delivery.projects.show', projects.find(p => p.id == data.delivery_project_id)?.slug || '#') : route('delivery.shipments.index')}
                        className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1 mb-2 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Catat Pengiriman</h2>
                    <p className="text-sm text-gray-500 mt-1">Input data pengiriman harian (Docket/Tiket)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="delivery_project_id" value="Proyek" />
                                <select
                                    id="delivery_project_id"
                                    className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.delivery_project_id}
                                    onChange={e => handleProjectChange(e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Proyek --</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name} ({project.customer.name})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.delivery_project_id} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="date" value="Tanggal Pengiriman" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="w-full mt-1"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.date} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <InputLabel htmlFor="docket_number" value="Docket Number / Tiket" />
                                <TextInput
                                    id="docket_number"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.docket_number}
                                    onChange={e => setData('docket_number', e.target.value)}
                                    placeholder="Contoh: SJ-001"
                                    required
                                />
                                <InputError message={errors.docket_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="rit_number" value="Ritase Ke-" />
                                <TextInput
                                    id="rit_number"
                                    type="number"
                                    className="w-full mt-1"
                                    value={data.rit_number}
                                    onChange={e => setData('rit_number', e.target.value)}
                                    placeholder="1"
                                    required
                                />
                                <InputError message={errors.rit_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="slump" value="Slump" />
                                <TextInput
                                    id="slump"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.slump}
                                    onChange={e => setData('slump', e.target.value)}
                                    placeholder="12 +/- 2"
                                />
                                <InputError message={errors.slump} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Detail Mutu & Volume</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <InputLabel htmlFor="concrete_grade_id" value="Mutu Beton" />
                                <select
                                    id="concrete_grade_id"
                                    className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.concrete_grade_id}
                                    onChange={e => handleGradeChange(e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Mutu --</option>
                                    {concreteGrades.map(grade => (
                                        <option key={grade.id} value={grade.id}>{grade.code}</option>
                                    ))}
                                </select>
                                <InputError message={errors.concrete_grade_id} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="volume" value="Volume (m3)" />
                                <TextInput
                                    id="volume"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1"
                                    value={data.volume}
                                    onChange={e => setData('volume', e.target.value)}
                                    placeholder="7.00"
                                    required
                                />
                                <InputError message={errors.volume} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="price_per_m3" value="Harga / m3" />
                                <TextInput
                                    id="price_per_m3"
                                    type="number"
                                    className="w-full mt-1"
                                    value={data.price_per_m3}
                                    onChange={e => setData('price_per_m3', e.target.value)}
                                    placeholder="Harga deal"
                                    required
                                />
                                <InputError message={errors.price_per_m3} className="mt-1" />
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-lg flex justify-between items-center border border-transparent dark:border-indigo-500/20">
                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase">Total Harga Ritase Ini</span>
                            <span className="text-xl font-black text-indigo-900 dark:text-white">{formatCurrency(data.total_price)}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Armada & Driver</h3>
                            <a href={route('delivery.trucks.index')} target="_blank" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Kelola Master Truck</a>
                        </div>
                        
                        <div className="mb-4">
                            <InputLabel htmlFor="delivery_truck_id" value="Pilih Truck (Auto-fill)" />
                            <select
                                id="delivery_truck_id"
                                className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.delivery_truck_id || ''}
                                onChange={e => handleTruckChange(e.target.value)}
                            >
                                <option value="">-- Manual / Tidak Ada di List --</option>
                                {trucks && trucks.map(truck => (
                                    <option key={truck.id} value={truck.id}>
                                        {truck.vehicle_number} {truck.driver_name ? `- ${truck.driver_name}` : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.delivery_truck_id} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="vehicle_number" value="Nomor Polisi Kendaraan" />
                                <TextInput
                                    id="vehicle_number"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.vehicle_number}
                                    onChange={e => setData('vehicle_number', e.target.value)}
                                    placeholder="G 1234 XX"
                                />
                                <InputError message={errors.vehicle_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="driver_name" value="Nama Driver" />
                                <TextInput
                                    id="driver_name"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.driver_name}
                                    onChange={e => setData('driver_name', e.target.value)}
                                    placeholder="Nama pengemudi"
                                />
                                <InputError message={errors.driver_name} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="notes" value="Catatan Tambahan" />
                            <textarea
                                id="notes"
                                className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                placeholder="Opsional"
                                rows="2"
                            ></textarea>
                            <InputError message={errors.notes} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Link 
                            href={data.delivery_project_id ? route('delivery.projects.show', projects.find(p => p.id == data.delivery_project_id)?.slug || '#') : route('delivery.shipments.index')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Batal
                        </Link>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Pengiriman'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </BendaharaLayout>
    );
}
