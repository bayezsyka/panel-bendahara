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
    Clock
} from 'lucide-react';

export default function ProjectDetail({ project, unbilled_shipments, billed_shipments, payments, concrete_grades = [], ledger = [] }) {
    const [activeTab, setActiveTab] = useState('ledger');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);

    // ... (keep form definitions)

    const paymentForm = useForm({
        amount: '',
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
        if (!project?.slug) return;
        paymentForm.post(route('receivable.project.payment.store', project.slug), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                paymentForm.reset();
            },
        });
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
    });

    const submitLegacy = (e) => {
        e.preventDefault();
        if (!project?.slug) return;
        legacyForm.post(route('receivable.project.legacy.store', project.slug), {
            onSuccess: () => {
                setIsLegacyModalOpen(false);
                legacyForm.reset();
            },
        });
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        <th className="px-4 py-3 text-center border-r border-slate-100">No</th>
                                        <th className="px-4 py-3 border-r border-slate-100">Tanggal</th>
                                        <th className="px-4 py-3 border-r border-slate-100">Customer</th>
                                        <th className="px-4 py-3 border-r border-slate-100">Mutu</th>
                                        <th className="px-4 py-3 text-right border-r border-slate-100">Harga m3</th>
                                        <th className="px-4 py-3 text-right border-r border-slate-100">Vol</th>
                                        <th className="px-4 py-3 text-right border-r border-slate-100">Total Vol</th>
                                        <th className="px-4 py-3 text-right border-r border-slate-100">Tagihan</th>
                                        <th className="px-4 py-3 text-right border-r border-slate-100">Total Tagihan</th>
                                        <th className="px-4 py-3 border-r border-slate-100">Tanggal</th>
                                        <th className="px-4 py-3 text-right border-r border-slate-100">Pembayaran</th>
                                        <th className="px-4 py-3 text-right border-r border-slate-100">Saldo Akhir</th>
                                        <th className="px-4 py-3">Ket</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                    {ledger.length === 0 ? (
                                        <tr><td colSpan="13" className="px-6 py-12 text-center text-slate-500 italic">Belum ada transaksi.</td></tr>
                                    ) : (
                                        ledger.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-center font-medium border-r border-slate-100">{index + 1}</td>
                                                {/* Shipment Columns */}
                                                <td className="px-4 py-3 border-r border-slate-100">
                                                    {item.type === 'shipment' ? new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                                                </td>
                                                <td className="px-4 py-3 font-bold border-r border-slate-100 truncate max-w-[150px]" title={project.name}>
                                                    {project.name}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-100">
                                                    {item.type === 'shipment' ? (item.concrete_grade?.code || '-') : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right border-r border-slate-100">
                                                    {item.type === 'shipment' ? formatCurrency(item.price_per_m3) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right border-r border-slate-100 font-medium">
                                                    {item.type === 'shipment' ? item.volume.toLocaleString('id-ID') : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right border-r border-slate-100 font-medium">
                                                    {item.total_volume.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-right border-r border-slate-100 font-bold text-slate-800 bg-slate-50/30">
                                                    {item.type === 'shipment' ? formatCurrency(item.debit) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right border-r border-slate-100 font-bold text-slate-800 bg-slate-50/30">
                                                    {formatCurrency(item.total_tagihan)}
                                                </td>
                                                
                                                {/* Payment Columns */}
                                                <td className="px-4 py-3 border-r border-slate-100">
                                                    {item.type === 'payment' ? new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right border-r border-slate-100 font-bold text-emerald-600 bg-emerald-50/30">
                                                    {item.type === 'payment' ? formatCurrency(item.credit) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right border-r border-slate-100 font-black text-indigo-700 bg-indigo-50/30">
                                                    {formatCurrency(item.balance)}
                                                </td>
                                                <td className="px-4 py-3 italic text-slate-500">
                                                    {item.type === 'payment' ? (item.description || item.notes) : (item.notes || '-')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">Belum ada transaksi pembayaran.</td></tr>
                                    ) : (
                                        payments.map(item => (
                                            <tr key={item.id} className="text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-6 py-4 font-bold">{item.description}</td>
                                                <td className="px-6 py-4 text-right text-emerald-600 font-bold">{formatCurrency(item.amount)}</td>
                                                <td className="px-6 py-4 text-slate-500">{item.notes || '-'}</td>
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
                        Input Pembayaran Baru
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
                                required
                            />
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
                        <SecondaryButton onClick={() => setIsPaymentModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={paymentForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                            Simpan Pembayaran
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
                            
                            {/* Checkbox aligns with the grid */}
                            <div className="flex items-end pb-2">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="mark_as_billed" 
                                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={invoiceForm.data.mark_as_billed}
                                        onChange={(e) => invoiceForm.setData('mark_as_billed', e.target.checked)}
                                    />
                                    <label htmlFor="mark_as_billed" className="ml-2 text-sm text-slate-700 font-medium select-none cursor-pointer">
                                        Tandai "Sudah Ditagih"
                                    </label>
                                </div>
                            </div>
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
                        Input Piutang (Migrasi Data)
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
                                    const grade = concrete_grades.find(g => g.id == e.target.value);
                                    legacyForm.setData({
                                        ...legacyForm.data,
                                        concrete_grade_id: e.target.value,
                                        price_per_m3: grade ? grade.price : legacyForm.data.price_per_m3
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
                                onChange={(e) => legacyForm.setData('volume', e.target.value)}
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
                                onChange={(e) => legacyForm.setData('price_per_m3', e.target.value)}
                                required
                            />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Tagihan</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                                {formatCurrency((legacyForm.data.volume || 0) * (legacyForm.data.price_per_m3 || 0))}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsLegacyModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={legacyForm.processing} className="bg-orange-600 hover:bg-orange-700">
                            Simpan Data Migrasi
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </BendaharaLayout>
    );
}
