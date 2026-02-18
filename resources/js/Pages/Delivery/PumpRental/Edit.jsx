import React, { useState, useEffect } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { Disclosure } from '@headlessui/react';

export default function Edit({ pumpRental, project }) {
    const { data, setData, put, processing, errors } = useForm({
        date: pumpRental.date,
        docket_number: pumpRental.docket_number || '',
        vehicle_number: pumpRental.vehicle_number || '',
        driver_name: pumpRental.driver_name || '',
        volume_pumped: pumpRental.volume_pumped || '', 
        pipes_used: pumpRental.pipes_used || '',    
        notes: pumpRental.notes || '',
    });

    const [totalEstimate, setTotalEstimate] = useState(parseFloat(pumpRental.total_price));
    const [overVolume, setOverVolume] = useState(0);
    const [overPipe, setOverPipe] = useState(0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        const volume = parseFloat(data.volume_pumped) || 0;
        const pipes = parseInt(data.pipes_used) || 0;

        const limitVol = parseFloat(project.pump_limit_volume) || 0;
        const limitPipe = parseInt(project.pump_limit_pipe) || 0;
        
        const rentalPrice = parseFloat(project.pump_rental_price) || 0;
        const overVolPrice = parseFloat(project.pump_over_volume_price) || 0;
        const overPipePrice = parseFloat(project.pump_over_pipe_price) || 0;

        const ov = Math.max(0, volume - limitVol);
        const op = Math.max(0, pipes - limitPipe);

        setOverVolume(ov);
        setOverPipe(op);

        const total = rentalPrice + (ov * overVolPrice) + (op * overPipePrice);
        setTotalEstimate(total);
    }, [data.volume_pumped, data.pipes_used, project]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('delivery.pump-rentals.update', pumpRental.id));
    };

    return (
        <BendaharaLayout>
            <Head title={`Edit Sewa Pompa: ${project.name}`} />

            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <Link 
                        href={route('delivery.projects.show', project.slug)}
                        className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1 mb-2 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali ke Proyek
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Sewa Pompa</h2>
                    <p className="text-sm text-gray-500 mt-1">Proyek: <span className="font-semibold">{project.name}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="date" value="Tanggal Sewa" />
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
                            <div>
                                <InputLabel htmlFor="docket_number" value="No. Surat Jalan / Tiket (Opsional)" />
                                <TextInput
                                    id="docket_number"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.docket_number}
                                    onChange={e => setData('docket_number', e.target.value)}
                                    placeholder="Nomor Tiket..."
                                />
                                <InputError message={errors.docket_number} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="vehicle_number" value="No. Polisi Truk Pompa" />
                                <TextInput
                                    id="vehicle_number"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.vehicle_number}
                                    onChange={e => setData('vehicle_number', e.target.value)}
                                    placeholder="Contoh: B 1234 CD"
                                />
                                <InputError message={errors.vehicle_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="driver_name" value="Nama Operator / Supir" />
                                <TextInput
                                    id="driver_name"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.driver_name}
                                    onChange={e => setData('driver_name', e.target.value)}
                                    placeholder="Nama Operator"
                                />
                                <InputError message={errors.driver_name} className="mt-1" />
                            </div>
                        </div>

                        {/* Advanced / Over Usage Section */}
                        <Disclosure defaultOpen={(parseFloat(pumpRental.volume_pumped) > parseFloat(pumpRental.limit_volume)) || (parseInt(pumpRental.pipes_used) > parseInt(pumpRental.limit_pipe))}>
                            {({ open }) => (
                                <div className="border border-gray-200 rounded-lg">
                                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">Advanced: Input Volume & Pipa Tambahan</span>
                                            {(data.volume_pumped || data.pipes_used) && (
                                                <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
                                            )}
                                        </div>
                                        <svg 
                                            className={`${
                                                open ? 'rotate-180 transform' : ''
                                            } h-5 w-5 text-gray-500 transition-transform`}
                                            fill="currentColor" 
                                            viewBox="0 0 20 20"
                                        >
                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Disclosure.Button>
                                    <Disclosure.Panel className="px-4 pt-4 pb-4 text-sm text-gray-500 bg-white rounded-b-lg border-t border-gray-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="volume_pumped" value="Total Volume Dipompa (m³)" />
                                                <TextInput
                                                    id="volume_pumped"
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full mt-1"
                                                    value={data.volume_pumped}
                                                    onChange={e => setData('volume_pumped', e.target.value)}
                                                    placeholder="0"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Limit: {project.pump_limit_volume} m³. 
                                                    {overVolume > 0 && <span className="text-red-600 font-bold ml-1">Over: {overVolume.toFixed(2)} m³ (+ {formatCurrency(overVolume * project.pump_over_volume_price)})</span>}
                                                </p>
                                                <InputError message={errors.volume_pumped} className="mt-1" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="pipes_used" value="Total Pipa Terpakai (Batang)" />
                                                <TextInput
                                                    id="pipes_used"
                                                    type="number"
                                                    className="w-full mt-1"
                                                    value={data.pipes_used}
                                                    onChange={e => setData('pipes_used', e.target.value)}
                                                    placeholder="0"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Limit: {project.pump_limit_pipe} btg.
                                                    {overPipe > 0 && <span className="text-red-600 font-bold ml-1">Over: {overPipe} btg (+ {formatCurrency(overPipe * project.pump_over_pipe_price)})</span>}
                                                </p>
                                                <InputError message={errors.pipes_used} className="mt-1" />
                                            </div>
                                        </div>
                                    </Disclosure.Panel>
                                </div>
                            )}
                        </Disclosure>

                        <div>
                            <InputLabel htmlFor="notes" value="Catatan Tambahan (Opsional)" />
                            <textarea
                                id="notes"
                                className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="3"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                placeholder="Tulis catatan jika ada..."
                            ></textarea>
                            <InputError message={errors.notes} className="mt-1" />
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                        <div className="text-sm">
                            <span className="text-gray-500 font-medium">Estimasi Total:</span>
                            <span className="ml-2 text-lg font-bold text-gray-900">{formatCurrency(totalEstimate)}</span>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route('delivery.projects.show', project.slug)}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Batal
                            </Link>
                            <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Perbarui Sewa Pompa'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </BendaharaLayout>
    );
}
