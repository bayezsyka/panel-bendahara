import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import Modal from '@/Components/Modal'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import PrimaryButton from '@/Components/PrimaryButton'
import SecondaryButton from '@/Components/SecondaryButton'
import InputError from '@/Components/InputError'

export default function Index({ projects }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form handling untuk buat proyek baru
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    status: 'ongoing',
  })

  const submitProject = (e) => {
    e.preventDefault()
    post(route('bendahara.projects.store'), {
      onSuccess: () => {
        setShowCreateModal(false)
        reset()
      },
    })
  }

  return (
    <BendaharaLayout>
      <Head title="Manajemen Proyek" />

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proyek Konstruksi</h1>
            <p className="mt-1 text-sm text-gray-500">Daftar proyek yang sedang berjalan atau selesai</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Proyek Baru
          </button>
        </div>

        {/* Grid List Proyek */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              href={route('bendahara.projects.show', project.id)} 
              key={project.id}
              className="group block bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition duration-200 overflow-hidden"
            >
              <div className="p-5">
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
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Lihat Detail & Keuangan</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500">Belum ada proyek dibuat.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Proyek */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <form onSubmit={submitProject} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Buat Proyek Baru</h2>
          
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

          <div className="mb-6">
            <InputLabel value="Status Awal" />
            <select
              value={data.status}
              onChange={e => setData('status', e.target.value)}
              className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            >
              <option value="ongoing">Sedang Berjalan</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setShowCreateModal(false)}>Batal</SecondaryButton>
            <PrimaryButton disabled={processing}>Simpan Proyek</PrimaryButton>
          </div>
        </form>
      </Modal>
    </BendaharaLayout>
  )
}