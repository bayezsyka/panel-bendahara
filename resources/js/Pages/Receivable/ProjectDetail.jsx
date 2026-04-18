import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { 
    FileSpreadsheet, 
    ArrowLeft,
    Receipt,
    History,
    CreditCard,
    Plus,
    FileDown,
    Calendar,
    CheckCircle2,
    Clock,
    Edit2,
    Trash2
} from 'lucide-react';

export default function ProjectDetail({ project, unbilled_shipments, billed_shipments, payments, concrete_grades = [], shipment_ledger = [], pump_ledger = [] }) {
    const [activeTab, setActiveTab] = useState('ledger');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [editingShipment, setEditingShipment] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);

    // ... (keep form definitions)

    const paymentForm = useForm({
        amount: '',
        refund_amount: '',
        date: new Date().toISOString().split('T')[0],
        description: 'Pembayaran Piutang',
        notes: '',
    });

    const invoiceForm = useForm({
        start_date: '',
        end_date: new Date().toISOString().split('T')[0],
        invoice_date: new Date().toISOString().split('T')[0],
        mark_as_billed: true,
        doc_no: '',
        delivery_note: '',
        po_so_no: '',
        terms_of_payment: '',
        due_date_jt: '',
        include_pump: true,
        include_dp: true,
    });

    const formatCurrency = (value) => {
        const number = Number(value);
        if (isNaN(number)) return 'Rp0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        
        if (editingPayment) {
            paymentForm.put(route('receivable.payment.update', editingPayment.id), {
                onSuccess: () => {
                    setIsPaymentModalOpen(false);
                    setEditingPayment(null);
                    paymentForm.reset();
                },
            });
        } else {
            if (!project?.slug) return;
            paymentForm.post(route('receivable.project.payment.store', project.slug), {
                onSuccess: () => {
                    setIsPaymentModalOpen(false);
                    paymentForm.reset();
                },
            });
        }
    };

    const handleEditPayment = (payment) => {
        const amt = parseFloat(payment.amount);
        setEditingPayment(payment);
        paymentForm.setData({
            amount: amt > 0 ? amt : '',
            refund_amount: amt < 0 ? Math.abs(amt) : '',
            date: payment.date.split('T')[0],
            description: payment.description,
            notes: payment.notes || '',
        });
        setIsPaymentModalOpen(true);
    };

    const handleDeletePayment = (payment) => {
        if (confirm('Apakah Anda yakin ingin menghapus pembayaran ini?')) {
            paymentForm.delete(route('receivable.payment.destroy', payment.id));
        }
    };
    
    const handleEditShipment = (item) => {
        const fullShipment = project.shipments.find(s => s.id === item.original_id);
        setEditingShipment(fullShipment);
        legacyForm.setData({
            date: fullShipment.date.split('T')[0],
            concrete_grade_id: fullShipment.concrete_grade_id,
            volume: fullShipment.volume,
            price_per_m3: fullShipment.price_per_m3,
            delivery_project_id: fullShipment.delivery_project_id,
            docket_number: fullShipment.docket_number || '',
            rit_number: fullShipment.rit_number || 1,
            slump: fullShipment.slump || '',
            vehicle_number: fullShipment.vehicle_number || '',
            driver_name: fullShipment.driver_name || '',
            total_price: fullShipment.total_price || (fullShipment.volume * fullShipment.price_per_m3),
            notes: fullShipment.notes || '',
        });
        setIsLegacyModalOpen(true);
    };

    const handleDeleteShipment = (item) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pengiriman ini?')) {
            paymentForm.delete(route('delivery.shipments.destroy', { shipment: item.original_id, from: 'receivable' }));
        }
    };

    const handleEditPumpRental = (item) => {
        window.location.href = route('delivery.pump-rentals.edit', { id: item.original_id, from: 'receivable' });
    };

    const handleDeletePumpRental = (item) => {
        if (confirm('Apakah Anda yakin ingin menghapus data sewa pompa ini?')) {
            paymentForm.delete(route('delivery.pump-rentals.destroy', { id: item.original_id, from: 'receivable' }));
        }
    };

    const handleExportInvoice = (e) => {
        e.preventDefault();
        if (!project?.slug) return;
        const url = route('receivable.project.export-invoice', {
            project: project.slug,
            ...invoiceForm.data
        });
        window.open(url, '_blank');
        setIsInvoiceModalOpen(false);
    };

    // ... (keep submitLegacy and legacyForm)

    const legacyForm = useForm({
        date: new Date().toISOString().split('T')[0],
        concrete_grade_id: '',
        volume: '',
        price_per_m3: '',
        // Full fields for update
        delivery_project_id: project.id,
        docket_number: '',
        rit_number: 1,
        slump: '',
        vehicle_number: '',
        driver_name: '',
        total_price: 0,
        notes: '',
    });

    const submitLegacy = (e) => {
        e.preventDefault();
        if (!project?.slug) return;

        if (editingShipment) {
            legacyForm.put(route('delivery.shipments.update', { shipment: editingShipment.id, from: 'receivable' }), {
                onSuccess: () => {
                    setIsLegacyModalOpen(false);
                    setEditingShipment(null);
                    legacyForm.reset();
                },
            });
        } else {
            legacyForm.post(route('receivable.project.legacy.store', project.slug), {
                onSuccess: () => {
                    setIsLegacyModalOpen(false);
                    legacyForm.reset();
                },
            });
        }
    };

    const tabs = [
        { id: 'ledger', label: 'Kartu Piutang', icon: FileSpreadsheet },
        { id: 'unbilled', label: 'Belum Ditagih', icon: Clock },
        { id: 'history', label: 'Riwayat Tagihan', icon: History },
        { id: 'payments', label: 'Pembayaran', icon: CreditCard },
    ];

    return (
        <BendaharaLayout>
            <Head title={`Transaksi ${project.name}`} />

            <div className="space-y-6">
                {/* ... (keep header) */}
                <Link 
                    href={project.customer_id ? route('receivable.customer.show', project.customer.slug) : '#'}
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="mr-1 w-4 h-4" />
                    Kembali ke Daftar Proyek
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <PageHeader 
                        title={project.name}
                        subtitle={`${project.customer.name} - ${project.location || 'No Location'}`}
                        icon={FileSpreadsheet}
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsLegacyModalOpen(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all shadow-sm"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Input Piutang
                        </button>
                        <button 
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Input Pembayaran
                        </button>
                        <button 
                            onClick={() => setIsInvoiceModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all shadow-sm"
                        >
                            <Receipt className="w-4 h-4 mr-2" />
                            Buat Invoice
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 gap-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative whitespace-nowrap ${
                                activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {activeTab === 'ledger' && (
                        <div className="space-y-8 p-4 bg-slate-50/50">
                            {/* Section 1: Concrete Shipments */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center">
                                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3" />
                                        Rekapitulasi Piutang Pengiriman Beton
                                    </h3>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-bold">
                                        Concrete Ledger
                                    </span>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                                    <th className="px-4 py-3 text-center border-r border-slate-100">No</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">Tanggal</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">Mutu</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Harga m3</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Vol</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Total Vol</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Tagihan</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Total Tagihan</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">Keterangan</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Pembayaran</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Saldo Akhir</th>
                                                    <th className="px-4 py-3 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                                {shipment_ledger.length === 0 ? (
                                                    <tr><td colSpan="11" className="px-6 py-12 text-center text-slate-500 italic">Belum ada transaksi pengiriman.</td></tr>
                                                ) : (
                                                    shipment_ledger.map((item, index) => (
                                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-4 py-3 text-center font-medium border-r border-slate-100 bg-slate-50/30">{index + 1}</td>
                                                            <td className="px-4 py-3 border-r border-slate-100">
                                                                {item.type === 'shipment' || item.type === 'payment' ? new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-slate-100 font-bold">
                                                                {item.type === 'shipment' ? (item.concrete_grade?.code || '-') : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100">
                                                                {item.type === 'shipment' ? formatCurrency(item.price_per_m3) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-medium">
                                                                {item.type === 'shipment' ? item.volume.toLocaleString('id-ID') : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-bold text-slate-500">
                                                                {item.total_volume.toLocaleString('id-ID')}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-bold text-slate-800 bg-slate-50/30">
                                                                {item.type === 'shipment' ? formatCurrency(item.debit) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-black text-slate-900 bg-slate-50/50">
                                                                {formatCurrency(item.total_tagihan)}
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-slate-100 italic text-slate-500 max-w-[200px] truncate" title={item.description || item.notes}>
                                                                {item.description || item.notes || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-bold text-emerald-600 bg-emerald-50/30">
                                                                {item.type === 'payment' ? formatCurrency(item.credit) : '-'}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-black border-r border-slate-100 ${item.balance <= 0 ? 'text-emerald-700 bg-emerald-50/30 font-black' : 'text-indigo-700 bg-indigo-50/30'}`}>
                                                                {item.balance < 0 ? `(${formatCurrency(Math.abs(item.balance))})` : formatCurrency(item.balance)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex justify-center gap-1">
                                                                    <button 
                                                                        onClick={() => item.type === 'shipment' ? handleEditShipment(item) : handleEditPayment(item)}
                                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => item.type === 'shipment' ? handleDeleteShipment(item) : handleDeletePayment(item)}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Hapus"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Pump Rentals */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center">
                                        <div className="w-1.5 h-6 bg-orange-500 rounded-full mr-3" />
                                        Rekapitulasi Sewa Pompa
                                    </h3>
                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-bold">
                                        Pump Rental History
                                    </span>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                                    <th className="px-4 py-3 text-center border-r border-slate-100">No</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">Tanggal</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">DN</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">Kendaraan</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">Driver</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100">Volume</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100 font-bold text-slate-800">Tagihan</th>
                                                    <th className="px-4 py-3 text-right border-r border-slate-100 font-black text-slate-900">Total Tagihan</th>
                                                    <th className="px-4 py-3 border-r border-slate-100">Catatan</th>
                                                    <th className="px-4 py-3 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                                {pump_ledger.length === 0 ? (
                                                    <tr><td colSpan="10" className="px-6 py-12 text-center text-slate-500 italic">Belum ada transaksi sewa pompa.</td></tr>
                                                ) : (
                                                    pump_ledger.map((item, index) => (
                                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-4 py-3 text-center font-medium border-r border-slate-100 bg-slate-50/30">{index + 1}</td>
                                                            <td className="px-4 py-3 border-r border-slate-100 font-bold bg-orange-50/10">
                                                                {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-slate-100 font-mono text-xs text-indigo-600 font-bold">{item.docket_number}</td>
                                                            <td className="px-4 py-3 border-r border-slate-100 uppercase text-[10px] font-black">{item.vehicle_number || '-'}</td>
                                                            <td className="px-4 py-3 border-r border-slate-100">{item.driver_name || '-'}</td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-medium">{item.volume_pumped} M3</td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-bold text-slate-800 bg-slate-50/30">
                                                                {formatCurrency(item.debit)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right border-r border-slate-100 font-black text-slate-900 bg-orange-50/20">
                                                                {formatCurrency(item.total_tagihan)}
                                                            </td>
                                                            <td className="px-4 py-3 italic text-slate-500 max-w-[200px] truncate border-r border-slate-100">{item.notes || '-'}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex justify-center gap-1">
                                                                    <button 
                                                                        onClick={() => handleEditPumpRental(item)}
                                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeletePumpRental(item)}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Hapus"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'unbilled' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">No. Docket (DN)</th>
                                        <th className="px-6 py-4">Mutu</th>
                                        <th className="px-6 py-4 text-center">Volume</th>
                                        <th className="px-6 py-4 text-right">Harga Satuan</th>
                                        {project.has_ppn && <th className="px-6 py-4 text-right">Total (DPP)</th>}
                                        <th className="px-6 py-4 text-right">Total {project.has_ppn ? '(+PPN)' : ''}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {unbilled_shipments.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">Semua pengiriman sudah ditagih.</td></tr>
                                    ) : (
                                        unbilled_shipments.map(item => (
                                            <tr key={item.id} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.docket_number}</td>
                                                <td className="px-6 py-4">{item.concrete_grade?.code || '-'}</td>
                                                <td className="px-6 py-4 text-center">{item.volume} M3</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(item.price_per_m3)}</td>
                                                {project.has_ppn && (
                                                    <td className="px-6 py-4 text-right text-slate-500">
                                                        {formatCurrency(item.total_price)}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-right font-bold">{formatCurrency(item.total_price_with_tax)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">No. Docket (DN)</th>
                                        <th className="px-6 py-4">Mutu</th>
                                        <th className="px-6 py-4 text-center">Volume</th>
                                        {project.has_ppn && <th className="px-6 py-4 text-right">Total (DPP)</th>}
                                        <th className="px-6 py-4 text-right">Total {project.has_ppn ? '(+PPN)' : ''}</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {billed_shipments.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">Belum ada riwayat tagihan.</td></tr>
                                    ) : (
                                        billed_shipments.map(item => (
                                            <tr key={item.id} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">{item.docket_number}</td>
                                                <td className="px-6 py-4">{item.concrete_grade?.code || '-'}</td>
                                                <td className="px-6 py-4 text-center">{item.volume} M3</td>
                                                {project.has_ppn && (
                                                    <td className="px-6 py-4 text-right text-slate-500">
                                                        {formatCurrency(item.total_price)}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-right">{formatCurrency(item.total_price_with_tax)}</td>
                                                <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                                                    <span className="inline-flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Billed</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">Keterangan</th>
                                        <th className="px-6 py-4 text-right">Jumlah Pembayaran</th>
                                        <th className="px-6 py-4">Catatan</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">Belum ada transaksi pembayaran.</td></tr>
                                    ) : (
                                        payments.map(item => (
                                            <tr key={item.id} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-6 py-4 font-bold">{item.description}</td>
                                                <td className="px-6 py-4 text-emerald-600 font-bold">{formatCurrency(item.amount)}</td>
                                                <td className="px-6 py-4 text-slate-500">{item.notes || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleEditPayment(item)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Pembayaran"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeletePayment(item)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Pembayaran"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <Modal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} maxWidth="lg">
                <form onSubmit={submitPayment} className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <CreditCard className="w-6 h-6 mr-2 text-emerald-600" />
                        {editingPayment ? 'Edit Pembayaran' : 'Input Pembayaran Baru'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="amount" value="Jumlah Pembayaran (Rp)" />
                            <TextInput
                                id="amount"
                                type="number"
                                className="mt-1 block w-full"
                                value={paymentForm.data.amount}
                                onChange={(e) => paymentForm.setData('amount', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="refund_amount" value="Nominal Pengembalian / Refund (Rp)" />
                            <TextInput
                                id="refund_amount"
                                type="number"
                                className="mt-1 block w-full border-red-300 focus:border-red-500 focus:ring-red-500"
                                value={paymentForm.data.refund_amount}
                                onChange={(e) => paymentForm.setData('refund_amount', e.target.value)}
                            />
                            <p className="mt-1 text-[10px] text-slate-500 italic">* Isi salah satu atau keduanya (sistem akan menghitung selisihnya)</p>
                        </div>

                        <div>
                            <InputLabel htmlFor="date" value="Tanggal Transaksi" />
                            <TextInput
                                id="date"
                                type="date"
                                className="mt-1 block w-full"
                                value={paymentForm.data.date}
                                onChange={(e) => paymentForm.setData('date', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Keterangan" />
                            <TextInput
                                id="description"
                                className="mt-1 block w-full"
                                value={paymentForm.data.description}
                                onChange={(e) => paymentForm.setData('description', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Catatan Tambahan (Opsional)" />
                            <textarea
                                id="notes"
                                className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="3"
                                value={paymentForm.data.notes}
                                onChange={(e) => paymentForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => {
                            setIsPaymentModalOpen(false);
                            setEditingPayment(null);
                            paymentForm.reset();
                        }}>Batal</SecondaryButton>
                        <PrimaryButton disabled={paymentForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                            {editingPayment ? 'Update Pembayaran' : 'Simpan Pembayaran'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Invoice Export Modal */}
            <Modal show={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} maxWidth="4xl">
                <form onSubmit={handleExportInvoice} className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <FileDown className="w-6 h-6 mr-2 text-indigo-600" />
                        Generate Invoice PDF
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Row 1: Dates */}
                            <div>
                                <InputLabel htmlFor="start_date" value="Dari Tanggal (DN)" />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.start_date}
                                    onChange={(e) => invoiceForm.setData('start_date', e.target.value)}
                                />
                                <p className="text-[10px] text-slate-500 mt-1">* Kosongkan untuk semua</p>
                            </div>
                            <div>
                                <InputLabel htmlFor="end_date" value="Sampai Tanggal (DN)" />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.end_date}
                                    onChange={(e) => invoiceForm.setData('end_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="invoice_date" value="Tanggal Invoice" />
                                <TextInput
                                    id="invoice_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.invoice_date}
                                    onChange={(e) => invoiceForm.setData('invoice_date', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Row 2: Document Details */}
                            <div>
                                <InputLabel htmlFor="doc_no" value="Doc. No." />
                                <TextInput
                                    id="doc_no"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.doc_no}
                                    onChange={(e) => invoiceForm.setData('doc_no', e.target.value)}
                                    placeholder="INV/JKK/..."
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="delivery_note" value="Delivery Note/Date" />
                                <TextInput
                                    id="delivery_note"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.delivery_note}
                                    onChange={(e) => invoiceForm.setData('delivery_note', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="po_so_no" value="PO atau SO No./Date" />
                                <TextInput
                                    id="po_so_no"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.po_so_no}
                                    onChange={(e) => invoiceForm.setData('po_so_no', e.target.value)}
                                />
                            </div>

                            {/* Row 3: Payment Terms */}
                            <div>
                                <InputLabel htmlFor="terms_of_payment" value="Terms of Payment" />
                                <TextInput
                                    id="terms_of_payment"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.terms_of_payment}
                                    onChange={(e) => invoiceForm.setData('terms_of_payment', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="due_date_jt" value="Due Date / JT" />
                                <TextInput
                                    id="due_date_jt"
                                    className="mt-1 block w-full"
                                    value={invoiceForm.data.due_date_jt}
                                    onChange={(e) => invoiceForm.setData('due_date_jt', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 mt-4 pt-4 border-t border-slate-100">
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={invoiceForm.data.include_pump}
                                    onChange={(e) => invoiceForm.setData('include_pump', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 group-hover:after:shadow-sm"></div>
                                <span className="ml-3 text-sm font-bold text-slate-700 select-none">Sertakan Sewa Pompa</span>
                            </label>

                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={invoiceForm.data.mark_as_billed}
                                    onChange={(e) => invoiceForm.setData('mark_as_billed', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 group-hover:after:shadow-sm"></div>
                                <span className="ml-3 text-sm font-bold text-slate-700 select-none">Tandai "Sudah Ditagih"</span>
                            </label>

                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={invoiceForm.data.include_dp}
                                    onChange={(e) => invoiceForm.setData('include_dp', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 group-hover:after:shadow-sm"></div>
                                <span className="ml-3 text-sm font-bold text-slate-700 select-none">Masukkan DP/Pembayaran</span>
                            </label>
                        </div>
                    </div>

                    <p className="mt-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        * Export ini akan mencakup pengiriman dalam periode yang dipilih dan otomatis menghitung total DP/pembayaran yang telah masuk hingga tanggal invoice.
                    </p>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsInvoiceModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700">
                            Unduh PDF Invoice
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Legacy Input Modal */}
            <Modal show={isLegacyModalOpen} onClose={() => setIsLegacyModalOpen(false)} maxWidth="lg">
                <form onSubmit={submitLegacy} className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Calendar className="w-6 h-6 mr-2 text-orange-600" />
                        {editingShipment ? 'Edit Data Pengiriman' : 'Input Piutang (Migrasi Data)'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="legacy_date" value="Tanggal Transaksi/Surat Jalan" />
                            <TextInput
                                id="legacy_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={legacyForm.data.date}
                                onChange={(e) => legacyForm.setData('date', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="concrete_grade_id" value="Mutu Beton" />
                            <select
                                id="concrete_grade_id"
                                className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={legacyForm.data.concrete_grade_id}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const grade = concrete_grades.find(g => g.id == selectedId);
                                    const newPrice = grade ? grade.price : legacyForm.data.price_per_m3;
                                    legacyForm.setData({
                                        ...legacyForm.data,
                                        concrete_grade_id: selectedId,
                                        price_per_m3: newPrice,
                                        total_price: legacyForm.data.volume * newPrice
                                    });
                                }}
                                required
                            >
                                <option value="">Pilih Mutu</option>
                                {concrete_grades.map(grade => (
                                    <option key={grade.id} value={grade.id}>{grade.code}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="volume" value="Volume (m&sup3;)" />
                            <TextInput
                                id="volume"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={legacyForm.data.volume}
                                onChange={(e) => {
                                    const vol = e.target.value;
                                    legacyForm.setData({
                                        ...legacyForm.data,
                                        volume: vol,
                                        total_price: vol * legacyForm.data.price_per_m3
                                    });
                                }}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="price_per_m3" value="Harga Satuan (Rp/m&sup3;)" />
                            <TextInput
                                id="price_per_m3"
                                type="number"
                                className="mt-1 block w-full"
                                value={legacyForm.data.price_per_m3}
                                onChange={(e) => {
                                    const price = e.target.value;
                                    legacyForm.setData({
                                        ...legacyForm.data,
                                        price_per_m3: price,
                                        total_price: legacyForm.data.volume * price
                                    });
                                }}
                                required
                            />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Tagihan</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                                {formatCurrency(legacyForm.data.total_price || (legacyForm.data.volume || 0) * (legacyForm.data.price_per_m3 || 0))}
                            </p>
                        </div>

                        <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informasi Tambahan (Opsional)</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="docket_number" value="No. Docket (DN)" />
                                    <TextInput
                                        id="docket_number"
                                        className="mt-1 block w-full"
                                        value={legacyForm.data.docket_number}
                                        onChange={(e) => legacyForm.setData('docket_number', e.target.value)}
                                        placeholder="DN-..."
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="rit_number" value="Rit Ke-" />
                                    <TextInput
                                        id="rit_number"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={legacyForm.data.rit_number}
                                        onChange={(e) => legacyForm.setData('rit_number', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="vehicle_number" value="No. Polisi Kendaraan" />
                                    <TextInput
                                        id="vehicle_number"
                                        className="mt-1 block w-full"
                                        value={legacyForm.data.vehicle_number}
                                        onChange={(e) => legacyForm.setData('vehicle_number', e.target.value)}
                                        placeholder="B 1234 ABC"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="driver_name" value="Nama Supir" />
                                    <TextInput
                                        id="driver_name"
                                        className="mt-1 block w-full"
                                        value={legacyForm.data.driver_name}
                                        onChange={(e) => legacyForm.setData('driver_name', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel htmlFor="notes" value="Catatan" />
                                <textarea
                                    id="notes"
                                    className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    rows="2"
                                    value={legacyForm.data.notes}
                                    onChange={(e) => legacyForm.setData('notes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => {
                            setIsLegacyModalOpen(false);
                            setEditingShipment(null);
                            legacyForm.reset();
                        }}>Batal</SecondaryButton>
                        <PrimaryButton disabled={legacyForm.processing} className="bg-orange-600 hover:bg-orange-700">
                            {editingShipment ? 'Update Data' : 'Simpan Data Migrasi'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </BendaharaLayout>
    );
}
