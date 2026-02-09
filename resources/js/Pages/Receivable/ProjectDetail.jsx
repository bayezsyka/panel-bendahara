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

export default function ProjectDetail({ project, unbilled_shipments, billed_shipments, payments }) {
    const [activeTab, setActiveTab] = useState('unbilled');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

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
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        paymentForm.post(route('receivable.project.payment.store', project.id), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                paymentForm.reset();
            },
        });
    };

    const handleExportInvoice = (e) => {
        e.preventDefault();
        const url = route('receivable.project.export-invoice', {
            project: project.id,
            ...invoiceForm.data
        });
        window.open(url, '_blank');
        setIsInvoiceModalOpen(false);
    };

    const tabs = [
        { id: 'unbilled', label: 'Belum Ditagih', icon: Clock },
        { id: 'history', label: 'Riwayat Tagihan', icon: History },
        { id: 'payments', label: 'Pembayaran', icon: CreditCard },
    ];

    return (
        <BendaharaLayout>
            <Head title={`Transaksi ${project.name}`} />

            <div className="space-y-6">
                <Link 
                    href={route('receivable.customer.show', project.customer_id)}
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
                <div className="flex border-b border-slate-200 gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
                                activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
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
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {unbilled_shipments.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">Semua pengiriman sudah ditagih.</td></tr>
                                    ) : (
                                        unbilled_shipments.map(item => (
                                            <tr key={item.id} className="text-sm">
                                                <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{item.docket_number}</td>
                                                <td className="px-6 py-4">{item.concrete_grade?.code || '-'}</td>
                                                <td className="px-6 py-4 text-center">{item.volume} M3</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(item.price_per_m3)}</td>
                                                <td className="px-6 py-4 text-right font-bold">{formatCurrency(item.total_price)}</td>
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
                                        <th className="px-6 py-4 text-right">Total</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {billed_shipments.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">Belum ada riwayat tagihan.</td></tr>
                                    ) : (
                                        billed_shipments.map(item => (
                                            <tr key={item.id} className="text-sm">
                                                <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-600">{item.docket_number}</td>
                                                <td className="px-6 py-4">{item.concrete_grade?.code || '-'}</td>
                                                <td className="px-6 py-4 text-center">{item.volume} M3</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(item.total_price)}</td>
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
                                            <tr key={item.id} className="text-sm">
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
            <Modal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} maxWidth="md">
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
            <Modal show={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} maxWidth="md">
                <form onSubmit={handleExportInvoice} className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <FileDown className="w-6 h-6 mr-2 text-indigo-600" />
                        Generate Invoice PDF
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        <div>
                            <InputLabel htmlFor="invoice_date" value="Tanggal Invoice (Di Cetakan)" />
                            <TextInput
                                id="invoice_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={invoiceForm.data.invoice_date}
                                onChange={(e) => invoiceForm.setData('invoice_date', e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center mt-4">
                            <input 
                                type="checkbox" 
                                id="mark_as_billed" 
                                className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={invoiceForm.data.mark_as_billed}
                                onChange={(e) => invoiceForm.setData('mark_as_billed', e.target.checked)}
                            />
                            <label htmlFor="mark_as_billed" className="ml-2 text-sm text-slate-700 font-medium">
                                Tandai pengiriman sebagai "Sudah Ditagih"
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
        </BendaharaLayout>
    );
}
