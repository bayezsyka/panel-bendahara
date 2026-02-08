import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import PageHeader from '@/Components/PageHeader'
import Modal from '@/Components/Modal'
import PrimaryButton from '@/Components/PrimaryButton'
import SecondaryButton from '@/Components/SecondaryButton'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import InputError from '@/Components/InputError'

const formatRupiah = (number) => {
  const n = Number(number || 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(n)
}

export default function Index({ requests, expenseTypes }) {
  const [active, setActive] = useState(null)

  const { data, setData, processing, errors, reset } = useForm({
    title: '',
    amount: '',
    transacted_at: '',
    description: '',
    review_note: '',
    expense_type_id: '',
  })

  const openReview = (r) => {
    setActive(r)
    setData({
      title: r.title || '',
      amount: r.amount || '',
      transacted_at: r.transacted_at || new Date().toISOString().slice(0, 10),
      description: r.description || '',
      review_note: '',
      expense_type_id: '',
    })
  }

  const close = () => {
    setActive(null)
    reset()
  }

  const approve = () => {
    if (!active) return
    router.put(
      route('projectexpense.expense-requests.approve', active.id),
      {
        title: data.title,
        amount: data.amount,
        transacted_at: data.transacted_at,
        description: data.description,
        expense_type_id: data.expense_type_id,
      },
      {
        onSuccess: () => close(),
        preserveScroll: true
      }
    )
  }

  const reject = () => {
    if (!active) return
    router.put(
      route('projectexpense.expense-requests.reject', active.id),
      {
        review_note: data.review_note
      },
      {
        onSuccess: () => close(),
        preserveScroll: true
      }
    )
  }

  return (
    <BendaharaLayout>
      <Head title="Pending Requests" />

      <PageHeader
        title="Permintaan Pending"
        backLink={route('projectexpense.overview')}
        backLabel="Dashboard"
        badge={requests.length > 0 ? {
          text: `${requests.length} Menunggu`,
          variant: 'yellow'
        } : null}
      />

      {/* Main List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Tidak ada request</h3>
            <p className="text-gray-500">Semua data dari WhatsApp sudah diproses.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((r) => (
              <div key={r.id} className="group p-5 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                
                {/* Icon Type */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      r.input_type === 'receipt'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-emerald-50 text-emerald-600'
                }`}>
                    {r.input_type === 'receipt' ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 truncate text-lg group-hover:text-indigo-600 transition-colors">
                        {r.title || 'Tanpa Judul'}
                      </h4>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        r.input_type === 'receipt' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                          {r.input_type === 'receipt' ? 'Struk' : 'Cash'}
                      </span>
                   </div>
                   
                   <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {r.project?.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {r.mandor?.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {r.transacted_at}
                      </div>
                   </div>
                </div>

                {/* Amount & Action */}
                <div className="flex items-center gap-4 sm:flex-col sm:items-end md:flex-row md:items-center">
                   <div className="font-mono font-bold text-gray-900 text-lg">
                      {formatRupiah(r.amount)}
                   </div>
                   <button
                    onClick={() => openReview(r)}
                    className="flex items-center gap-1 bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                   >
                     Review
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal show={!!active} onClose={close} maxWidth="2xl">
        {active && (
          <div className="flex flex-col h-full bg-white">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-bold text-gray-900">Review Pengeluaran</h2>
                  <p className="text-sm text-gray-500">
                    {active.mandor?.name} • {active.project?.name}
                  </p>
               </div>
               <button onClick={close} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
                {/* Image Preview */}
                {active.receipt_image && (
                <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bukti Foto</span>
                        <a href={`/storage/${active.receipt_image}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                            Buka Full
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                    <div className="relative rounded-lg overflow-hidden shadow-sm h-48 bg-gray-200">
                         <img src={`/storage/${active.receipt_image}`} alt="Struk" className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
                )}

                {/* AI Extracted Items Table */}
                {Array.isArray(active.items) && active.items.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Item Terdeteksi (AI)</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {active.items.map((it, idx) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 text-sm text-gray-900">{it.name}</td>
                                    <td className="px-3 py-2 text-sm text-gray-500 text-right">{it.quantity}</td>
                                    <td className="px-3 py-2 text-sm text-gray-500 text-right">{formatRupiah(it.price)}</td>
                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">{formatRupiah(it.total ?? (it.quantity * it.price))}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-4 md:col-span-2">
                        <div>
                            <InputLabel value="Judul Pengeluaran" className="text-gray-700" />
                            <TextInput
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Beli Semen 50 Sak"
                            />
                            <InputError className="mt-1" message={errors.title} />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                         <InputLabel value="Tipe Biaya / Kategori" className="text-gray-700 font-bold" />
                         <select
                            value={data.expense_type_id}
                            onChange={(e => setData('expense_type_id', e.target.value))}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm bg-yellow-50 text-gray-900 font-medium"
                         >
                             <option value="">-- Pilih Tipe Biaya (Wajib) --</option>
                             {expenseTypes.map((type) => (
                                 <option key={type.id} value={type.id}>
                                     {type.name} ({type.code})
                                 </option>
                             ))}
                         </select>
                         <InputError className="mt-1" message={errors.expense_type_id} />
                    </div>

                    <div>
                        <InputLabel value="Nominal (Rp)" className="text-gray-700" />
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">Rp</span>
                            </div>
                            <TextInput
                                className="block w-full pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                        </div>
                        <InputError className="mt-1" message={errors.amount} />
                    </div>

                    <div>
                        <InputLabel value="Tanggal" className="text-gray-700" />
                        <TextInput
                            type="date"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            value={data.transacted_at}
                            onChange={(e) => setData('transacted_at', e.target.value)}
                        />
                        <InputError className="mt-1" message={errors.transacted_at} />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel value="Keterangan (Opsional)" className="text-gray-700" />
                        <TextInput
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Catatan tambahan..."
                        />
                        <InputError className="mt-1" message={errors.description} />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <InputLabel value="Catatan Jika Ditolak" className="text-red-700" />
                    <TextInput
                        className="mt-1 block w-full border-red-200 focus:border-red-500 focus:ring-red-500 rounded-lg bg-red-50"
                        value={data.review_note}
                        onChange={(e) => setData('review_note', e.target.value)}
                        placeholder="Alasan penolakan..."
                    />
                </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 rounded-b-xl">
                <SecondaryButton onClick={close} disabled={processing}>
                  Batal
                </SecondaryButton>
                <button
                    onClick={reject}
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 disabled:opacity-50"
                >
                    {processing ? 'Proses...' : 'Tolak'}
                </button>
                <PrimaryButton onClick={approve} disabled={processing}>
                    {processing ? 'Memproses...' : 'Setujui'}
                </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </BendaharaLayout>
  )
}