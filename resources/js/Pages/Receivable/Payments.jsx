import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { 
    History, 
    ArrowLeft,
    Search,
    CreditCard,
    Calendar,
    ChevronRight,
    User,
    Edit2,
    Trash2,
    X
} from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Payments({ payments }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);

    const paymentForm = useForm({
        amount: '',
        refund_amount: '',
        date: '',
        description: '',
        notes: '',
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

    const handleEdit = (payment) => {
        const amt = parseFloat(payment.amount);
        setEditingPayment(payment);
        paymentForm.setData({
            amount: amt > 0 ? amt : '',
            refund_amount: amt < 0 ? Math.abs(amt) : '',
            date: payment.date.split('T')[0],
            description: payment.description,
            notes: payment.notes || '',
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (payment) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            paymentForm.delete(route('receivable.payment.destroy', payment.id));
        }
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        paymentForm.put(route('receivable.payment.update', editingPayment.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingPayment(null);
                paymentForm.reset();
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title="Riwayat Pembayaran" />

            <div className="space-y-6">
                <PageHeader 
                    title="Riwayat Pembayaran"
                    subtitle="Monitor seluruh arus kas masuk yang tercatat sebagai pelunasan piutang."
                    icon={History}
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-slate-900">Seluruh Transaksi Pembayaran</h3>
                        <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full">
                            Menampilkan {payments.from} - {payments.to} dari {payments.total} transaksi
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Penerima</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Jumlah</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-slate-900">
                                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                    {new Date(payment.date).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{payment.customer?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 italic">
                                                "{payment.description}"
                                                {payment.notes && <div className="text-[10px] text-slate-400">Nb: {payment.notes}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-black text-emerald-600">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                            </td>
                                             <td className="px-6 py-4 text-center">
                                                {payment.delivery_project ? (
                                                    <Link 
                                                        href={route('receivable.project.show', payment.delivery_project.slug)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                                                    >
                                                        Lihat Proyek
                                                        <ChevronRight className="ml-1 w-3 h-3" />
                                                    </Link>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-medium border border-slate-100">
                                                        Tanpa Proyek
                                                    </span>
                                                )}
                                                <div className="mt-2 flex justify-center gap-1">
                                                    <button 
                                                        onClick={() => handleEdit(payment)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Pembayaran"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(payment)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Pembayaran"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                             </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            Belum ada data pembayaran ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments.links.length > 3 && (
                        <div className="p-6 border-t border-slate-100 flex justify-center gap-1">
                            {payments.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        link.active 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="lg">
                <form onSubmit={submitUpdate} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center">
                            <CreditCard className="w-6 h-6 mr-2 text-indigo-600" />
                            Edit Pembayaran
                        </h2>
                        <button 
                            type="button" 
                            onClick={() => setIsEditModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

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
                            <TextArea
                                id="description"
                                className="mt-1 block w-full"
                                value={paymentForm.data.description}
                                onChange={(e) => paymentForm.setData('description', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Catatan Tambahan (Opsional)" />
                            <TextArea
                                id="notes"
                                className="mt-1 block w-full"
                                rows="3"
                                value={paymentForm.data.notes}
                                onChange={(e) => paymentForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={paymentForm.processing} className="bg-indigo-600 hover:bg-indigo-700">
                            Update Pembayaran
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </BendaharaLayout>
    );
}
