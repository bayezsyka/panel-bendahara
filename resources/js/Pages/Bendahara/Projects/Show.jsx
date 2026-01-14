import React, { useState } from 'react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import Modal from '@/Components/Modal'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import PrimaryButton from '@/Components/PrimaryButton'
import SecondaryButton from '@/Components/SecondaryButton'
import InputError from '@/Components/InputError'

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}

export default function Show({ project }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false) // Modal Edit Proyek
  const [showImageModal, setShowImageModal] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const totalExpense = project.expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0)

  // Form Tambah Pengeluaran
  const { data, setData, post, processing, errors, reset } = useForm({
    project_id: project.id,
    title: '',
    amount: '',
    transacted_at: new Date().toISOString().split('T')[0],
    description: '',
    receipt_image: null,
  })

  // Form Edit Proyek (Lengkap)
  const editForm = useForm({
    name: project.name,
    description: project.description || '',
    status: project.status,
    coordinates: project.coordinates || '',
  })

  const submitExpense = (e) => {
    e.preventDefault()
    post(route('bendahara.expenses.store'), {
      onSuccess: () => {
        setShowExpenseModal(false)
        reset()
      },
      forceFormData: true,
    })
  }

  // Submit Edit Proyek
  const submitEditProject = (e) => {
    e.preventDefault()
    editForm.put(route('bendahara.projects.update', project.id), {
        onSuccess: () => setShowEditModal(false)
    })
  }

  const handleDeleteExpense = (id) => {
    if(confirm('Yakin ingin menghapus data pengeluaran ini?')) {
        router.delete(route('bendahara.expenses.destroy', id));
    }
  }

  return (
    <BendaharaLayout>
      <Head title={`Proyek: ${project.name}`} />

      <div className="mb-6">
        <Link href={route('bendahara.projects.index')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 mb-2">
            &larr; Kembali ke Daftar Proyek
        </Link>
        
        {/* Header Proyek */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                        project.status === 'ongoing' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                        {project.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                    </span>
                    {/* Tombol Trigger Edit Proyek */}
                    <button 
                        onClick={() => setShowEditModal(true)}
                        className="text-gray-400 hover:text-indigo-600 transition p-1"
                        title="Edit Detail Proyek"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                </div>
                <p className="text-gray-500 mt-1">{project.description}</p>

                {/* PREVIEW GMAPS */}
                {project.coordinates && (
                    <div className="mt-4 max-w-xl">
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                            {/* Iframe Google Maps */}
                            <iframe 
                                width="100%" 
                                height="250" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0" 
                                // Menggunakan encodeURIComponent untuk menangani karakter derajat dll
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(project.coordinates)}&output=embed`}
                            ></iframe>
                            
                            <div className="p-2 bg-white flex justify-between items-center text-sm">
                                <span className="text-gray-500 truncate max-w-[200px]">{project.coordinates}</span>
                                <a 
                                    // Link untuk rute langsung
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(project.coordinates)}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Rute ke Lokasi
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Tombol Aksi Kanan */}
            <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center mt-4 lg:mt-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Periode:</span>
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                    />
                </div>
                <a 
                    href={route('bendahara.projects.export', { project: project.id, month: selectedMonth })}
                    target="_blank"
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export PDF
                </a>
                <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Catat Pengeluaran
                </button>
            </div>
        </div>
      </div>

      {/* --- Bagian Statistik & Tabel (Tidak berubah signifikan) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium">Total Pengeluaran</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(totalExpense)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium">Jumlah Transaksi</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{project.expenses.length} Item</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium">Terakhir Update</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
                {project.expenses.length > 0 
                    ? new Date(project.expenses[0].transacted_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) 
                    : '-'}
            </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Riwayat Pengeluaran</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {project.expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {new Date(expense.transacted_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                                <div className="text-xs text-gray-500">{expense.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                {expense.receipt_image ? (
                                    <button 
                                        onClick={() => setShowImageModal(`/storage/${expense.receipt_image}`)}
                                        className="text-indigo-600 hover:text-indigo-900 text-xs font-medium underline"
                                    >
                                        Lihat Foto
                                    </button>
                                ) : (
                                    <span className="text-gray-400 text-xs italic">Tanpa Foto</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                {formatRupiah(expense.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded hover:bg-red-100"
                                    title="Hapus"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {project.expenses.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Belum ada pengeluaran tercatat.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Edit Proyek (BARU) */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <form onSubmit={submitEditProject} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Data Proyek</h2>
            
            <div className="mb-4">
                <InputLabel value="Nama Proyek" />
                <TextInput
                    value={editForm.data.name}
                    onChange={e => editForm.setData('name', e.target.value)}
                    className="mt-1 block w-full"
                    required
                />
                <InputError message={editForm.errors.name} className="mt-2" />
            </div>

            <div className="mb-4">
                <InputLabel value="Deskripsi" />
                <textarea
                    value={editForm.data.description}
                    onChange={e => editForm.setData('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows="3"
                />
            </div>

            <div className="mb-4">
                <InputLabel value="Koordinat Lokasi" />
                <TextInput
                    value={editForm.data.coordinates}
                    onChange={e => editForm.setData('coordinates', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder={'6°52\'09.6"S 109°02\'34.5"E'}
                />
                <p className="text-xs text-gray-500 mt-1">Gunakan format koordinat Google Maps.</p>
                <InputError message={editForm.errors.coordinates} className="mt-2" />
            </div>

            <div className="mb-6">
                <InputLabel value="Status" />
                <select
                    value={editForm.data.status}
                    onChange={e => editForm.setData('status', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                >
                    <option value="ongoing">Sedang Berjalan</option>
                    <option value="completed">Selesai</option>
                </select>
            </div>

            <div className="flex justify-end gap-3">
                <SecondaryButton onClick={() => setShowEditModal(false)}>Batal</SecondaryButton>
                <PrimaryButton disabled={editForm.processing}>Simpan Perubahan</PrimaryButton>
            </div>
        </form>
      </Modal>

      {/* Modal Catat Pengeluaran */}
      <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)}>
        <form onSubmit={submitExpense} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Catat Pengeluaran Baru</h2>
            {/* ... (Isi form pengeluaran sama seperti sebelumnya) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <InputLabel value="Judul Pengeluaran" />
                    <TextInput 
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Misal: Beli Semen"
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="Nominal (Rp)" />
                    <TextInput 
                        type="number"
                        value={data.amount}
                        onChange={e => setData('amount', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.amount} className="mt-2" />
                </div>
            </div>
            {/* ... sisa form pengeluaran ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <InputLabel value="Tanggal Transaksi" />
                    <TextInput 
                        type="date"
                        value={data.transacted_at}
                        onChange={e => setData('transacted_at', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                </div>
                <div>
                    <InputLabel value="Foto Struk (Opsional)" />
                    <input 
                        type="file"
                        onChange={e => setData('receipt_image', e.target.files[0])}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        accept="image/*"
                    />
                </div>
            </div>
            <div className="mb-6">
                <InputLabel value="Keterangan" />
                <textarea 
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows="2"
                ></textarea>
            </div>
            <div className="flex justify-end gap-3">
                <SecondaryButton onClick={() => setShowExpenseModal(false)}>Batal</SecondaryButton>
                <PrimaryButton disabled={processing}>Simpan Pengeluaran</PrimaryButton>
            </div>
        </form>
      </Modal>

      {/* Modal Lihat Gambar */}
      <Modal show={!!showImageModal} onClose={() => setShowImageModal(null)}>
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Bukti Transaksi</h3>
                <button onClick={() => setShowImageModal(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            {showImageModal && (
                <img src={showImageModal} alt="Struk" className="w-full h-auto rounded-lg border border-gray-200" />
            )}
            <div className="mt-4 text-right">
                <SecondaryButton onClick={() => setShowImageModal(null)}>Tutup</SecondaryButton>
            </div>
        </div>
      </Modal>

    </BendaharaLayout>
  )
}