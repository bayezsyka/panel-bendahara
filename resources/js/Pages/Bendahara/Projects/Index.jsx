import React, { useState, useEffect } from 'react' // Tambah useEffect
import { Head, Link, useForm } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import Modal from '@/Components/Modal'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import PrimaryButton from '@/Components/PrimaryButton'
import SecondaryButton from '@/Components/SecondaryButton'
import InputError from '@/Components/InputError'

export default function Index({ projects }) {
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // State untuk tahu sedang edit atau buat baru
  const [currentProject, setCurrentProject] = useState(null) // Menyimpan data proyek yang sedang diedit
  
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    description: '',
    status: 'ongoing',
  })

  // Fungsi untuk membuka modal dalam mode "Buat Baru"
  const openCreateModal = () => {
    setIsEditing(false)
    setCurrentProject(null)
    reset()
    clearErrors()
    setShowModal(true)
  }

  // Fungsi untuk membuka modal dalam mode "Edit"
  const openEditModal = (project) => {
    setIsEditing(true)
    setCurrentProject(project)
    // Isi form dengan data yang sudah ada
    setData({
        name: project.name,
        description: project.description || '',
        status: project.status,
    })
    clearErrors()
    setShowModal(true)
  }

  const submitProject = (e) => {
    e.preventDefault()
    
    if (isEditing) {
        // PERUBAHAN: Jika mode edit, gunakan method PUT ke rute update
        put(route('bendahara.projects.update', currentProject.id), {
            onSuccess: () => {
                setShowModal(false)
                reset()
            },
        })
    } else {
        // PERUBAHAN: Jika mode baru, gunakan method POST ke rute store
        post(route('bendahara.projects.store'), {
            onSuccess: () => {
                setShowModal(false)
                reset()
            },
        })
    }
  }

  return (
    <BendaharaLayout>
      <Head title="Manajemen Proyek" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proyek Konstruksi</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola status dan progres proyek di sini</p>
          </div>
          <button
            onClick={openCreateModal} // Panggil fungsi openCreateModal
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Proyek Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group flex flex-col bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition duration-200 overflow-hidden">
                {/* Bagian atas bisa diklik untuk melihat detail */}
                <Link href={route('bendahara.projects.show', project.id)} className="flex-1 p-5 block">
                    <div className="flex justify-between items-start mb-4">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'ongoing' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                        {project.status === 'ongoing' ? 'Sedang Berjalan' : 'Selesai'}
                    </div>
                    <span className="text-xs text-gray-400">
                        {new Date(project.created_at).toLocaleDateString('id-ID')}
                    </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                    {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                    {project.description || 'Tidak ada deskripsi.'}
                    </p>
                </Link>

                {/* Bagian bawah: Tombol Aksi */}
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                    <Link href={route('bendahara.projects.show', project.id)} className="text-xs font-medium text-gray-600 hover:text-indigo-600">
                        Lihat Detail
                    </Link>
                    
                    {/* PERUBAHAN: Tombol Edit Status */}
                    <button 
                        onClick={() => openEditModal(project)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Status
                    </button>
                </div>
            </div>
          ))}
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={submitProject} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? 'Edit Proyek' : 'Buat Proyek Baru'}
          </h2>
          
          <div className="mb-4">
            <InputLabel value="Nama Proyek" />
            <TextInput
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              className="mt-1 block w-full"
              placeholder="Contoh: Renovasi Gedung A"
              autoFocus
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          <div className="mb-4">
            <InputLabel value="Deskripsi (Opsional)" />
            <textarea
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
              rows="3"
            />
          </div>

          {/* PERUBAHAN: Pilihan Status */}
          <div className="mb-6">
            <InputLabel value="Status Proyek" />
            <select
              value={data.status}
              onChange={e => setData('status', e.target.value)}
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            >
              <option value="ongoing">Sedang Berjalan</option>
              <option value="completed">Selesai (Completed)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
                Ubah ke "Selesai" jika proyek telah rampung.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setShowModal(false)}>Batal</SecondaryButton>
            <PrimaryButton disabled={processing}>
                {isEditing ? 'Simpan Perubahan' : 'Simpan Proyek'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </BendaharaLayout>
  )
}