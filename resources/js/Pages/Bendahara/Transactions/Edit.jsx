import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'

export default function Edit({ transaction }) {
  const { data, setData, put, processing, errors } = useForm({
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    transacted_at: transaction.transacted_at,
  })

  function submit(e) {
    e.preventDefault()
    put(`/bendahara/transactions/${transaction.id}`)
  }

  return (
    <BendaharaLayout>
      <Head title="Edit Transaksi" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Transaksi</h1>
            <p className="mt-1 text-sm text-gray-500">Perbarui data transaksi</p>
          </div>
          <Link
            href="/bendahara/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setData('type', 'income')}
                className={`relative flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  data.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  data.type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <span className="font-medium">Pemasukan</span>
              </button>

              <button
                type="button"
                onClick={() => setData('type', 'expense')}
                className={`relative flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  data.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  data.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <span className="font-medium">Pengeluaran</span>
              </button>
            </div>
            {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nominal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <input
              type="text"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="Masukkan deskripsi transaksi..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              value={data.transacted_at}
              onChange={(e) => setData('transacted_at', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.transacted_at && <p className="mt-2 text-sm text-red-600">{errors.transacted_at}</p>}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Transaksi
                </>
              )}
            </button>
            <Link href="/bendahara/transactions" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Batal
            </Link>
          </div>
        </form>
      </div>
    </BendaharaLayout>
  )
}
