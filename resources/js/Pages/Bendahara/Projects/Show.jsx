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

export default function Show({ project, mandors }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false) 
  const [showImageModal, setShowImageModal] = useState(null)
  
  // State untuk Sorting Toggle
  const [sortBy, setSortBy] = useState('transacted_at') // 'transacted_at' or 'created_at'

  const isCompleted = project.status === 'completed';
  const totalExpense = project.expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0)

  // Form Pengeluaran Baru dengan ITEMS Array
  const { data, setData, post, processing, errors, reset } = useForm({
    project_id: project.id,
    title: '',
    transacted_at: new Date().toISOString().split('T')[0],
    description: '',
    receipt_image: null,
    items: [
        { name: '', quantity: 1, price: 0 } // Inisialisasi 1 baris kosong
    ]
  })

  // Hitung Total Otomatis untuk Display di Modal
  const currentTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  const editForm = useForm({
    name: project.name,
    description: project.description || '',
    status: project.status,
    coordinates: project.coordinates || '',
    mandor_id: project.mandor_id || '',
  })

  // Logika Sorting Data di Sisi Client
  const sortedExpenses = [...project.expenses].sort((a, b) => {
      const dateA = new Date(a[sortBy]);
      const dateB = new Date(b[sortBy]);
      return dateB - dateA; // Descending (Terbaru diatas)
  });

  // --- Handlers untuk Form Item ---
  const handleAddItem = () => {
      setData('items', [...data.items, { name: '', quantity: 1, price: 0 }]);
  }

  const handleRemoveItem = (index) => {
      const newItems = data.items.filter((_, i) => i !== index);
      setData('items', newItems);
  }

  const handleItemChange = (index, field, value) => {
      const newItems = [...data.items];
      newItems[index][field] = value;
      setData('items', newItems);
  }
  // --------------------------------

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
            ← Kembali ke Daftar Proyek
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                        isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                        {isCompleted ? 'Completed' : 'Ongoing'}
                    </span>
                    
                    {!isCompleted && (
                        <button 
                            onClick={() => setShowEditModal(true)}
                            className="text-gray-400 hover:text-indigo-600 transition p-1"
                            title="Edit Detail Proyek"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                    )}
                </div>
                
                {project.mandor && (
                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md w-fit">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Mandor: <span className="font-semibold">{project.mandor.name}</span>
                    </div>
                )}

                <p className="text-gray-500 mt-2">{project.description}</p>

                {project.coordinates && (
                    <div className="mt-4 max-w-xl">
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                            <iframe 
                                width="100%" 
                                height="250" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0" 
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(project.coordinates)}&hl=id&z=14&output=embed`}
                            ></iframe>
                            <div className="p-2 bg-white flex justify-between items-center text-sm">
                                <span className="text-gray-500 truncate max-w-[200px]">{project.coordinates}</span>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.coordinates)}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                                >
                                    Rute ke Lokasi
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center mt-4 lg:mt-0">
                <a 
                    href={route('bendahara.projects.export', { project: project.id })}
                    target="_blank"
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export Laporan PDF
                </a>
                
                {!isCompleted ? (
                    <button 
                        onClick={() => setShowExpenseModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                    >
                        Catat Pengeluaran
                    </button>
                ) : (
                    <div className="px-4 py-2 bg-gray-100 text-gray-500 font-medium rounded-lg border border-gray-200 cursor-not-allowed flex items-center gap-2 select-none">
                        Proyek Terkunci
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium">Total Pengeluaran</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(totalExpense)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium">Jumlah Transaksi</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{project.expenses.length} Nota</div>
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
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-semibold text-gray-800">Riwayat Pengeluaran</h3>
            
            {/* Toggle Sorting */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setSortBy('transacted_at')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        sortBy === 'transacted_at' 
                        ? 'bg-white text-indigo-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Tanggal Nota
                </button>
                <button
                    onClick={() => setSortBy('created_at')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        sortBy === 'created_at' 
                        ? 'bg-white text-indigo-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Tanggal Input
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Item & Keterangan</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nota</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                                <div className="font-semibold text-gray-900">
                                    {new Date(expense[sortBy]).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {sortBy === 'transacted_at' ? 'Nota' : 'Diinput'}
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="font-bold text-indigo-700 mb-1">{expense.title}</div>
                                
                                {/* List Item Detail */}
                                {expense.items && expense.items.length > 0 ? (
                                    <ul className="text-sm text-gray-700 bg-gray-50 rounded-md p-2 space-y-1 border border-gray-100">
                                        {expense.items.map((item, idx) => (
                                            <li key={item.id || idx} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                                                <span className="flex-1">
                                                    <span className="font-medium">{item.name}</span>
                                                    <span className="text-xs text-gray-500 ml-1">
                                                        ({item.quantity} x {formatRupiah(item.price)})
                                                    </span>
                                                </span>
                                                <span className="font-medium text-gray-900 ml-4">
                                                    {formatRupiah(item.total_price)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">Tidak ada detail item.</div>
                                )}
                                
                                {expense.description && (
                                    <div className="text-xs text-gray-500 mt-2 italic">"{expense.description}"</div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center align-top">
                                {expense.receipt_image ? (
                                    <button 
                                        onClick={() => setShowImageModal(`/storage/${expense.receipt_image}`)}
                                        className="text-indigo-600 hover:text-indigo-900 text-xs font-medium underline border border-indigo-200 rounded px-2 py-1 bg-indigo-50"
                                    >
                                        Lihat Foto
                                    </button>
                                ) : (
                                    <span className="text-gray-400 text-xs italic">Tanpa Foto</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 align-top">
                                {formatRupiah(expense.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                                {!isCompleted && (
                                    <button 
                                        onClick={() => handleDeleteExpense(expense.id)}
                                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded hover:bg-red-100"
                                        title="Hapus"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {sortedExpenses.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Belum ada pengeluaran tercatat.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Edit Proyek */}
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
                <InputLabel value="Mandor Penanggung Jawab" />
                <select
                    value={editForm.data.mandor_id}
                    onChange={e => editForm.setData('mandor_id', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                >
                    <option value="">-- Pilih Mandor --</option>
                    {mandors.map((mandor) => (
                        <option key={mandor.id} value={mandor.id}>
                            {mandor.name} ({mandor.whatsapp_number})
                        </option>
                    ))}
                </select>
                <InputError message={editForm.errors.mandor_id} className="mt-2" />
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

      {/* Modal Catat Pengeluaran BARU (Multi Item) */}
      <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)}>
        <form onSubmit={submitExpense} className="p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Catat Pengeluaran Baru</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <InputLabel value="Judul Nota / Toko" />
                    <TextInput 
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Cth: TB. Sinar Jaya"
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>
                <div>
                    <InputLabel value="Tanggal Transaksi (di Nota)" />
                    <TextInput 
                        type="date"
                        value={data.transacted_at}
                        onChange={e => setData('transacted_at', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                </div>
            </div>

            {/* Bagian Input Item Dinamis */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <InputLabel value="Daftar Barang Belanjaan" />
                    <button 
                        type="button" 
                        onClick={handleAddItem}
                        className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-medium border border-indigo-200"
                    >
                        + Tambah Item
                    </button>
                </div>
                
                <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {data.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white p-2 rounded shadow-sm">
                            <div className="flex-1 w-full">
                                <TextInput
                                    placeholder="Nama Barang"
                                    value={item.name}
                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                    className="w-full text-sm"
                                    required
                                />
                            </div>
                            <div className="w-20">
                                <TextInput
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-full text-sm text-center"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="w-32">
                                <TextInput
                                    type="number"
                                    placeholder="Harga @"
                                    value={item.price}
                                    onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full text-sm text-right"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="w-32 text-right text-sm font-semibold text-gray-700 px-2">
                                {formatRupiah(item.quantity * item.price)}
                            </div>
                            {data.items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {errors.items && <div className="text-red-600 text-sm mt-1">{errors.items}</div>}
            </div>

            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
                <span className="font-semibold text-indigo-900">Total Nota</span>
                <span className="text-xl font-bold text-indigo-700">{formatRupiah(currentTotal)}</span>
            </div>
            
            <div className="mb-4">
                <InputLabel value="Foto Struk (Opsional)" />
                <input 
                    type="file"
                    onChange={e => setData('receipt_image', e.target.files[0])}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    accept="image/*"
                />
            </div>

            <div className="mb-6">
                <InputLabel value="Catatan Tambahan (Opsional)" />
                <textarea 
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                    rows="2"
                    placeholder="Keterangan lain jika diperlukan..."
                ></textarea>
            </div>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-100">
                <SecondaryButton onClick={() => setShowExpenseModal(false)}>Batal</SecondaryButton>
                <PrimaryButton disabled={processing}>Simpan Pengeluaran</PrimaryButton>
            </div>
        </form>
      </Modal>

      {/* Modal Lihat Gambar */}
      <Modal show={!!showImageModal} onClose={() => setShowImageModal(null)}>
        <div className="p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
            <h3 className="font-medium">Bukti Transaksi</h3>
            <button type="button" onClick={() => setShowImageModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            {showImageModal && (<img src={showImageModal} alt="Struk" className="w-full h-auto max-h-[75vh] object-contain rounded-lg border border-gray-200" />)}
            <div className="mt-4 text-right"><SecondaryButton onClick={() => setShowImageModal(null)}>Tutup</SecondaryButton></div>
        </div>
      </Modal>

    </BendaharaLayout>
  )
}