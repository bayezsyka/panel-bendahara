import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Index({ setting }) {
    const { data, setData, post, processing, errors } = useForm({
        pump_rental_price: setting.pump_rental_price || 0,
        pump_limit_volume: setting.pump_limit_volume || 0,
        pump_over_volume_price: setting.pump_over_volume_price || 0,
        pump_limit_pipe: setting.pump_limit_pipe || 0,
        pump_over_pipe_price: setting.pump_over_pipe_price || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('delivery.pump-rental-settings.update'));
    };

    return (
        <BendaharaLayout>
            <Head title="Pengaturan Sewa Pompa" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pengaturan Sewa Pompa</h2>
                    <p className="text-sm text-gray-500 mt-1">Konfigurasi default harga dan limit sewa pompa untuk proyek baru.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="pump_rental_price" value="Harga Sewa Pompa (per Set)" />
                                <TextInput
                                    id="pump_rental_price"
                                    type="number"
                                    className="w-full mt-1"
                                    value={data.pump_rental_price}
                                    onChange={e => setData('pump_rental_price', e.target.value)}
                                    placeholder="0"
                                />
                                <InputError message={errors.pump_rental_price} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="pump_limit_volume" value="Limit Volume (m³)" />
                                <div className="flex items-center gap-2">
                                    <TextInput
                                        id="pump_limit_volume"
                                        type="number"
                                        step="0.01"
                                        className="w-full mt-1"
                                        value={data.pump_limit_volume}
                                        onChange={e => setData('pump_limit_volume', e.target.value)}
                                        placeholder="0"
                                    />
                                    <span className="text-sm text-gray-500 mt-1">m³</span>
                                </div>
                                <InputError message={errors.pump_limit_volume} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="pump_over_volume_price" value="Harga Over Volume (per m³)" />
                                <TextInput
                                    id="pump_over_volume_price"
                                    type="number"
                                    className="w-full mt-1"
                                    value={data.pump_over_volume_price}
                                    onChange={e => setData('pump_over_volume_price', e.target.value)}
                                    placeholder="0"
                                />
                                <InputError message={errors.pump_over_volume_price} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="pump_limit_pipe" value="Limit Pipa (Batang)" />
                                <div className="flex items-center gap-2">
                                    <TextInput
                                        id="pump_limit_pipe"
                                        type="number"
                                        className="w-full mt-1"
                                        value={data.pump_limit_pipe}
                                        onChange={e => setData('pump_limit_pipe', e.target.value)}
                                        placeholder="0"
                                    />
                                    <span className="text-sm text-gray-500 mt-1">btg</span>
                                </div>
                                <InputError message={errors.pump_limit_pipe} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="pump_over_pipe_price" value="Harga Over Pipa (per Batang)" />
                                <TextInput
                                    id="pump_over_pipe_price"
                                    type="number"
                                    className="w-full mt-1"
                                    value={data.pump_over_pipe_price}
                                    onChange={e => setData('pump_over_pipe_price', e.target.value)}
                                    placeholder="0"
                                />
                                <InputError message={errors.pump_over_pipe_price} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t border-gray-100">
                        <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </BendaharaLayout>
    );
}
