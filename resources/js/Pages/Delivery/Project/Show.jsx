import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';

export default function Show({ project, trashedShipments = [], trashedPumpRentals = [] }) {
    const { auth } = usePage().props;
    const { can_create, can_edit } = auth.permissions || {};

    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [shipmentSortField, setShipmentSortField] = React.useState('date');
    const [shipmentSortDirection, setShipmentSortDirection] = React.useState('asc');

    const shipmentSortOptions = [
        { value: 'date', label: 'Tanggal' },
        { value: 'docket_number', label: 'Docket Number' },
        { value: 'rit_number', label: 'Rit' },
        { value: 'volume', label: 'Volume' },
        { value: 'total_price_with_tax', label: 'Nilai' },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getShipmentSortValue = (shipment, field) => {
        switch (field) {
            case 'date':
                return new Date(shipment.date).getTime();
            case 'rit_number':
                return Number(shipment.rit_number || 0);
            case 'volume':
                return Number(shipment.volume || 0);
            case 'total_price_with_tax':
                return Number(shipment.total_price_with_tax || 0);
            case 'docket_number': {
                const docket = shipment.docket_number ?? '';
                const numericDocket = Number(docket);
                return Number.isNaN(numericDocket) ? String(docket).toLowerCase() : numericDocket;
            }
            default:
                return String(shipment[field] ?? '').toLowerCase();
        }
    };

    const sortedShipments = [...project.shipments].sort((a, b) => {
        const left = getShipmentSortValue(a, shipmentSortField);
        const right = getShipmentSortValue(b, shipmentSortField);

        if (typeof left === 'string' || typeof right === 'string') {
            const comparison = String(left).localeCompare(String(right), 'id-ID', { numeric: true, sensitivity: 'base' });
            return shipmentSortDirection === 'asc' ? comparison : -comparison;
        }

        const comparison = left === right ? 0 : left > right ? 1 : -1;
        return shipmentSortDirection === 'asc' ? comparison : -comparison;
    });

    const shipmentTotalVolume = sortedShipments.reduce((sum, shipment) => sum + parseFloat(shipment.volume || 0), 0);
    const shipmentTotalPrice = sortedShipments.reduce((sum, shipment) => sum + parseFloat(shipment.total_price || 0), 0);
    const shipmentTotalPriceWithTax = sortedShipments.reduce((sum, shipment) => sum + parseFloat(shipment.total_price_with_tax || 0), 0);

    const toggleShipmentSort = (field) => {
        if (shipmentSortField === field) {
            setShipmentSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
            return;
        }

        setShipmentSortField(field);
        setShipmentSortDirection(field === 'date' ? 'asc' : 'desc');
    };

    const renderSortArrow = (field) => {
        if (shipmentSortField !== field) {
            return (
                <svg className="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 15l4 4 4-4M8 9l4-4 4 4" />
                </svg>
            );
        }

        return shipmentSortDirection === 'asc' ? (
            <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const renderSortableHeader = (label, field, align = 'left') => (
        <th className={`px-4 py-4 ${align === 'right' ? 'text-right' : ''}`}>
            <button
                type="button"
                onClick={() => toggleShipmentSort(field)}
                className={`group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    shipmentSortField === field ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'
                } ${align === 'right' ? 'ml-auto' : ''}`}
            >
                <span>{label}</span>
                {renderSortArrow(field)}
            </button>
        </th>
    );

    const restoreShipment = (id) => {
        Swal.fire({
            title: 'Pulihkan Pengiriman?',
            text: 'Data pengiriman ini akan dikembalikan ke daftar aktif.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Pulihkan!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('delivery.shipments.restore', id), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    const restorePumpRental = (id) => {
        Swal.fire({
            title: 'Pulihkan Sewa Pompa?',
            text: 'Data sewa pompa ini akan dikembalikan ke daftar aktif.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Pulihkan!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('delivery.pump-rentals.restore', id), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title={`Proyek: ${project.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <Link
                            href={route('delivery.customers.show', project.customer.slug)}
                            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1 mb-2 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Kembali ke Customer
                        </Link>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded border border-blue-100">
                                Berjalan
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Customer: <Link href={route('delivery.customers.show', project.customer.slug)} className="text-indigo-600 hover:underline">{project.customer.name}</Link>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {can_edit && (
                            <Link
                                href={route('delivery.projects.edit', project.slug)}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm text-sm transition-colors"
                            >
                                Edit Proyek
                            </Link>
                        )}
                        <Link
                            href={route('delivery.pump-rentals.create', { project_id: project.id })}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm text-sm transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Sewa Pompa
                        </Link>
                        {can_create && (
                            <Link
                                href={route('delivery.shipments.create', { project_id: project.id })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm text-sm transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Buat Pengiriman
                            </Link>
                        )}
                    </div>
                </div>

                {/* Detail Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Proyek</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Lokasi Proyek</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.location || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Sub-Contractor / Penerima</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.sub_contractor || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Kontak Lapangan / PIC</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.contact_person || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Pekerjaan</p>
                                <p className="text-sm text-gray-900 font-semibold mt-1">{project.work_type || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Estimasi & Mutu</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Default Mutu Beton</p>
                                <p className="text-sm text-gray-900 font-bold mt-1">
                                    {project.default_concrete_grade ? (
                                        <span className="flex items-center justify-between">
                                            {project.default_concrete_grade.code}
                                            <span className="text-gray-500 font-normal">{formatCurrency(project.default_concrete_grade.price)}</span>
                                        </span>
                                    ) : '-'}
                                </p>
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-xs text-gray-400 font-medium uppercase">Total Ritase</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{project.shipments.length} <span className="text-xs text-gray-400 font-medium">Pengiriman</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sewa Pompa</h3>
                            {can_edit && (
                                <Link
                                    href={route('delivery.projects.edit', project.slug)}
                                    className="text-gray-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Edit Pengaturan Pompa"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </Link>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Harga Sewa</p>
                                <p className="text-sm text-gray-900 font-bold mt-1">
                                    {project.pump_rental_price ? formatCurrency(project.pump_rental_price) : '-'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Limit Vol</p>
                                    <p className="text-sm text-gray-900 font-semibold mt-1">{project.pump_limit_volume ? project.pump_limit_volume + ' m³' : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Limit Pipa</p>
                                    <p className="text-sm text-gray-900 font-semibold mt-1">{project.pump_limit_pipe ? project.pump_limit_pipe + ' btg' : '-'}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-xs text-gray-400 font-medium uppercase">Total Sewa</p>
                                <p className="text-2xl font-bold text-indigo-600 mt-1">{project.pump_rentals ? project.pump_rentals.length : 0} <span className="text-xs font-medium text-indigo-400">Kali</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rekapitulasi Tiket / Surat Jalan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">Rekapitulasi Tiket</h3>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                {project.shipments.length} Pengiriman
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Urutkan:</span>
                                <select
                                    value={shipmentSortField}
                                    onChange={(e) => setShipmentSortField(e.target.value)}
                                    className="border-0 bg-transparent pr-6 text-[11px] font-bold text-gray-700 focus:ring-0"
                                >
                                    {shipmentSortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShipmentSortDirection((current) => current === 'asc' ? 'desc' : 'asc')}
                                    className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-indigo-700 transition-colors hover:bg-indigo-100"
                                    title={shipmentSortDirection === 'asc' ? 'Urutan naik' : 'Urutan turun'}
                                >
                                    {shipmentSortDirection === 'asc' ? 'Naik' : 'Turun'}
                                    {renderSortArrow(shipmentSortField)}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Dari:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="text-[10px] border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 px-2"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">S/D:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-[10px] border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 px-2"
                                />
                            </div>
                            {project.shipments.length > 0 && (
                                <a
                                    href={route('delivery.projects.export-recap-pdf', {
                                        project: project.slug,
                                        start_date: startDate,
                                        end_date: endDate
                                    })}
                                    target="_blank"
                                    className="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-black text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-tighter"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Cetak Rekap
                                </a>
                            )}
                        </div>
                    </div>

                    {project.shipments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">No</th>
                                        {renderSortableHeader('Tanggal', 'date')}
                                        {renderSortableHeader('Docket Number', 'docket_number')}
                                        {renderSortableHeader('Rit', 'rit_number')}
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mutu</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Slump</th>
                                        {renderSortableHeader('Volume', 'volume', 'right')}
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">No Polisi</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supir</th>
                                        {project.has_ppn && <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Nilai (DPP)</th>}
                                        {renderSortableHeader(`Nilai ${project.has_ppn ? '(+PPN)' : ''}`, 'total_price_with_tax', 'right')}
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sortedShipments.map((shipment, index) => (
                                        <tr key={shipment.id} className="hover:bg-gray-50/70 transition-colors group">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-400 text-center">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                                {new Date(shipment.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900 underline decoration-indigo-200 decoration-2 underline-offset-4">{shipment.docket_number}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">Rit {shipment.rit_number}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded border border-indigo-100 italic">
                                                    {shipment.concrete_grade.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 font-medium italic">{shipment.slump || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-black text-right">{shipment.volume} m³</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 font-bold uppercase">{shipment.vehicle_number || '-'}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{shipment.driver_name || '-'}</td>
                                            {project.has_ppn && (
                                                <td className="px-4 py-3 text-sm text-gray-500 font-medium text-right tabular-nums">
                                                    {formatCurrency(shipment.total_price)}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-sm text-gray-900 font-bold text-right tabular-nums">{formatCurrency(shipment.total_price_with_tax)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {can_edit && (
                                                        <Link
                                                            href={route('delivery.shipments.edit', shipment.id)}
                                                            className="p-1 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route('delivery.shipments.show', shipment.id)}
                                                        className="p-1 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
                                                        title="Detail"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                    {can_edit && (
                                                        <button
                                                            onClick={() => {
                                                                Swal.fire({
                                                                    title: 'Hapus Pengiriman?',
                                                                    html: `<p class="text-sm text-gray-500">Data pengiriman <strong>"${shipment.docket_number}"</strong> akan dipindahkan ke sampah.</p>`,
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: '#dc2626',
                                                                    cancelButtonColor: '#6b7280',
                                                                    confirmButtonText: 'Ya, Hapus!',
                                                                    cancelButtonText: 'Batal',
                                                                    reverseButtons: true,
                                                                }).then((result) => {
                                                                    if (result.isConfirmed) {
                                                                        router.delete(route('delivery.shipments.destroy', shipment.id));
                                                                    }
                                                                });
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/80 font-black border-t-2 border-gray-100">
                                    <tr>
                                        <td colSpan="6" className="px-4 py-4 text-xs text-gray-400 uppercase tracking-widest text-right">Total Rekapitulasi</td>
                                        <td className="px-4 py-4 text-sm text-gray-900 text-right tabular-nums">
                                            {shipmentTotalVolume.toFixed(2)} m³
                                        </td>
                                        <td colSpan="2"></td>
                                        {project.has_ppn && (
                                            <td className="px-4 py-4 text-sm text-gray-500 text-right tabular-nums">
                                                {formatCurrency(shipmentTotalPrice)}
                                            </td>
                                        )}
                                        <td className="px-4 py-4 text-base text-indigo-700 text-right tabular-nums">
                                            {formatCurrency(shipmentTotalPriceWithTax)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Belum Ada Pengiriman</h4>
                            <p className="text-gray-500 mt-1 max-w-sm">Siapkan pengiriman pertama untuk mulai mencatat pengiriman beton pada proyek ini.</p>
                            {can_create && (
                                <Link
                                    href={route('delivery.shipments.create', { project_id: project.id })}
                                    className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    + Mulai Buat Pengiriman
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Rekapitulasi Sewa Pompa */}
                {project.pump_rentals && project.pump_rentals.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 text-lg">Rekapitulasi Sewa Pompa</h3>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                    {project.pump_rentals.length} Sewa
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">No</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ket.</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Vol Pump</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Pipa</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Biaya</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {project.pump_rentals.map((rental, index) => (
                                        <tr key={rental.id} className="hover:bg-gray-50/70 transition-colors group">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-400 text-center">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                                {new Date(rental.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                                {rental.vehicle_number && <span className="block text-xs font-bold text-gray-500">{rental.vehicle_number}</span>}
                                                {rental.driver_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium text-right font-mono">
                                                {parseFloat(rental.volume_pumped) > parseFloat(rental.limit_volume) ? (
                                                    <span className="text-red-600" title={`Over ${(rental.volume_pumped - rental.limit_volume)}`}>{rental.volume_pumped} (+{(rental.volume_pumped - rental.limit_volume)})</span>
                                                ) : rental.volume_pumped} m³
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium text-right font-mono">
                                                {parseInt(rental.pipes_used) > parseInt(rental.limit_pipe) ? (
                                                    <span className="text-red-600" title={`Over ${(rental.pipes_used - rental.limit_pipe)}`}>{rental.pipes_used} (+{(rental.pipes_used - rental.limit_pipe)})</span>
                                                ) : rental.pipes_used} btg
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 font-bold text-right tabular-nums">{formatCurrency(rental.total_price)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {can_edit && (
                                                        <>
                                                            <Link
                                                                href={route('delivery.pump-rentals.edit', rental.id)}
                                                                className="p-1 text-gray-400 hover:text-indigo-600 rounded-md transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            </Link>
                                                            <button
                                                                onClick={(e) => {
                                                                    Swal.fire({
                                                                        title: 'Hapus Sewa Pompa?',
                                                                        text: 'Data sewa pompa ini akan dipindahkan ke sampah.',
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonColor: '#dc2626',
                                                                        cancelButtonColor: '#6b7280',
                                                                        confirmButtonText: 'Ya, Hapus!',
                                                                        cancelButtonText: 'Batal',
                                                                        reverseButtons: true,
                                                                    }).then((result) => {
                                                                        if (result.isConfirmed) {
                                                                            router.delete(route('delivery.pump-rentals.destroy', rental.id));
                                                                        }
                                                                    });
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/80 font-black border-t-2 border-gray-100">
                                    <tr>
                                        <td colSpan="5" className="px-4 py-4 text-xs text-gray-400 uppercase tracking-widest text-right">Total Sewa</td>
                                        <td className="px-4 py-4 text-base text-indigo-700 text-right tabular-nums">
                                            {formatCurrency(project.pump_rentals.reduce((sum, s) => sum + parseFloat(s.total_price), 0))}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Trashed Items Section */}
                {(trashedShipments.length > 0 || trashedPumpRentals.length > 0) && (
                    <div className="mt-12 pt-12 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Sampah (Data yang Dihapus)
                        </h3>

                        <div className="space-y-8">
                            {trashedShipments.length > 0 && (
                                <div className="bg-red-50/30 rounded-xl border border-red-100 overflow-hidden">
                                    <div className="px-6 py-3 bg-red-50/50 border-b border-red-100">
                                        <h4 className="text-sm font-bold text-red-700">Pengiriman Dihapus</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Tgl</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Docket</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Vol</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-red-50">
                                                {trashedShipments.map((s) => (
                                                    <tr key={s.id} className="text-xs">
                                                        <td className="px-4 py-2">{new Date(s.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 font-mono">{s.docket_number}</td>
                                                        <td className="px-4 py-2 text-right">{s.volume} m³</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <button
                                                                onClick={() => restoreShipment(s.id)}
                                                                className="inline-flex items-center px-3 py-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-black uppercase transition-all shadow-sm active:scale-95"
                                                            >
                                                                Pulihkan
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {trashedPumpRentals.length > 0 && (
                                <div className="bg-red-50/30 rounded-xl border border-red-100 overflow-hidden">
                                    <div className="px-6 py-3 bg-red-50/50 border-b border-red-100">
                                        <h4 className="text-sm font-bold text-red-700">Sewa Pompa Dihapus</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Tgl</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Total</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-red-50">
                                                {trashedPumpRentals.map((r) => (
                                                    <tr key={r.id} className="text-xs">
                                                        <td className="px-4 py-2">{new Date(r.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 text-right">{formatCurrency(r.total_price)}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <button
                                                                onClick={() => restorePumpRental(r.id)}
                                                                className="inline-flex items-center px-3 py-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-black uppercase transition-all shadow-sm active:scale-95"
                                                            >
                                                                Pulihkan
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </BendaharaLayout>
    );
}
