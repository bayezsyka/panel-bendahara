import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import PageHeader from '@/Components/PageHeader'
import Modal from '@/Components/Modal'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import PrimaryButton from '@/Components/PrimaryButton'
import SecondaryButton from '@/Components/SecondaryButton'
import InputError from '@/Components/InputError'

export default function Index({ projects, mandors }) {
  const [showModal, setShowModal] = useState(false)
  const [isStatusUpdate, setIsStatusUpdate] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    description: '',
    status: 'ongoing',
    coordinates: '',
    mandor_id: '',
    only_status: false,
  })

  const openCreateModal = () => {
    setIsStatusUpdate(false)
    setCurrentProject(null)
    reset()
    clearErrors()
    setShowModal(true)
  }

  const openStatusModal = (project) => {
    setIsStatusUpdate(true)
    setCurrentProject(project)
    setData({
        status: project.status,
        only_status: true,
    })
    clearErrors()
    setShowModal(true)
  }

  const submitProject = (e) => {
    e.preventDefault()
    
    if (isStatusUpdate) {
        put(route('bendahara.projects.update', currentProject.id), {
            onSuccess: () => {
                setShowModal(false)
                reset()
            },
        })
    } else {
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
      <Head title="Proyek Konstruksi" />

      <div className="space-y-6">
        <PageHeader
          title="Proyek Konstruksi"
          backLink={route('bendahara.dashboard')}
          backLabel="Dashboard"
          actions={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Proyek
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group flex flex-col bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition duration-200 overflow-hidden">
                <Link href={route('bendahara.projects.show', project.id)} className="flex-1 p-5 block">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            project.status === 'ongoing' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                            {project.status === 'ongoing' ? 'Berjalan' : 'Selesai'}
                        </div>
                        <span className="text-xs text-gray-400">
                            {new Date(project.created_at).toLocaleDateString('id-ID')}
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                        {project.name}
                    </h3>
                    
                    {project.mandor && (
                        <div className="mb-2 flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">
                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {project.mandor.name}
                        </div>
                    )}

                    <p className="text-sm text-gray-500 line-clamp-2">
                        {project.description || 'Tidak ada deskripsi.'}
                    </p>
                    
                    {project.coordinates && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Lokasi Tersedia
                        </div>
                    )}
                </Link>

                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                    <Link href={route('bendahara.projects.show', project.id)} className="text-xs font-medium text-gray-600 hover:text-indigo-600">
                        Lihat Detail
                    </Link>
                    
                    <button 
                        onClick={() => openStatusModal(project)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Ubah Status
                    </button>
                </div>
            </div>
          ))}
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={submitProject} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {isStatusUpdate ? 'Update Status Proyek' : 'Buat Proyek Baru'}
          </h2>
          
          {!isStatusUpdate && (
              <>
                <div className="mb-4">
                    <InputLabel value="Nama Proyek" />
                    <TextInput
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Contoh: Renovasi Gedung A"
                        autoFocus
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mb-4">
                    <InputLabel value="Pilih Mandor (Opsional)" />
                    <select
                        value={data.mandor_id}
                        onChange={e => setData('mandor_id', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    >
                        <option value="">-- Belum Ada Mandor --</option>
                        {mandors.map((mandor) => (
                            <option key={mandor.id} value={mandor.id}>
                                {mandor.name} ({mandor.whatsapp_number})
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.mandor_id} className="mt-2" />
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

                <div className="mb-4">
                    <InputLabel value="Koordinat Lokasi (Google Maps)" />
                    <TextInput
                        value={data.coordinates}
                        onChange={e => setData('coordinates', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder={'Contoh: 6°52\'09.6"S 109°02\'34.5"E'}
                    />
                    <InputError message={errors.coordinates} className="mt-2" />
                </div>
              </>
          )}

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
          </div>

          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setShowModal(false)}>Batal</SecondaryButton>
            <PrimaryButton disabled={processing}>
                Simpan
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </BendaharaLayout>
  )
}