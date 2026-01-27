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

export default function Index({ projects, mandors, benderas }) {
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  
  const [search, setSearch] = useState('')
  
  const filteredProjects = projects.filter(project => {
    const searchLower = search.toLowerCase()
    return project.name.toLowerCase().includes(searchLower) ||
           (project.description && project.description.toLowerCase().includes(searchLower)) ||
           (project.location && project.location.toLowerCase().includes(searchLower)) ||
           (project.bendera && project.bendera.name.toLowerCase().includes(searchLower)) ||
           (project.mandors && project.mandors.some(m => m.name.toLowerCase().includes(searchLower)))
  })

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    description: '',
    status: 'ongoing',
    coordinates: '',
    mandor_id: '',
    mandor_ids: [],
    bendera_id: '',
    location: '',
  })

  const openCreateModal = () => {
    setIsEditing(false)
    setCurrentProject(null)
    reset()
    clearErrors()
    setShowModal(true)
  }

  const openEditModal = (project) => {
    setIsEditing(true)
    setCurrentProject(project)
    const mandorIds = project.mandors ? project.mandors.map(m => m.id) : (project.mandor_id ? [project.mandor_id] : [])
    setData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        coordinates: project.coordinates || '',
        mandor_id: project.mandor_id || '',
        mandor_ids: mandorIds,
        bendera_id: project.bendera_id || '',
        location: project.location || '',
    })
    clearErrors()
    setShowModal(true)
  }

  const submitProject = (e) => {
    e.preventDefault()
    
    if (isEditing) {
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

        {/* Search Bar */}
        <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                placeholder="Cari proyek berdasar nama, lokasi, bendera, atau pelaksana..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
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
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition">
                          {project.name}
                      </h3>
  
                      {/* Badge Bendera */}
                      {project.bendera && (
                          <div className="mb-3 inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-100 text-purple-700">
                             🏢 {project.bendera.name}
                          </div>
                      )}
                      
                      <div className="space-y-2 mb-2">
                          {/* Tampilkan multiple mandors jika ada */}
                          {project.mandors && project.mandors.length > 0 ? (
                              <div className="space-y-1.5">
                                  {project.mandors.map((mandor, idx) => (
                                      <div key={mandor.id} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded border border-gray-100">
                                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                          <span className="font-medium">Pelaksana {idx + 1}: {mandor.name}</span>
                                      </div>
                                  ))}
                              </div>
                          ) : project.mandor && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded border border-gray-100">
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="font-medium">Pelaksana: {project.mandor.name}</span>
                              </div>
                          )}
  
                          {(project.location || project.coordinates) && (
                              <div className="flex items-start gap-2 text-xs text-gray-500 px-2">
                                  <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  <span className="line-clamp-1">{project.location || 'Lokasi Koordinat Tersedia'}</span>
                              </div>
                          )}
                      </div>
  
                      <p className="text-sm text-gray-500 line-clamp-2 mt-3 pt-3 border-t border-dashed border-gray-100">
                          {project.description || 'Tidak ada deskripsi.'}
                      </p>
                  </Link>
  
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                      <Link href={route('bendahara.projects.show', project.id)} className="text-xs font-medium text-gray-600 hover:text-indigo-600">
                          Lihat Detail
                      </Link>
                      
                      <button 
                          onClick={() => openEditModal(project)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Proyek
                      </button>
                  </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 font-medium">Tidak ada proyek yang cocok dengan "{search}"</p>
            </div>
          )}
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
                    required
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                     <InputLabel value="Bendera (PT/CV)" />
                    <select
                        value={data.bendera_id}
                        onChange={e => setData('bendera_id', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    >
                        <option value="">-- Pilih Bendera --</option>
                        {benderas.map((bendera) => (
                            <option key={bendera.id} value={bendera.id}>
                                {bendera.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.bendera_id} className="mt-2" />
                </div>
            </div>

            <div className="mb-4">
                <InputLabel value="Pelaksana (Bisa Pilih Lebih dari 1)" />
                <div className="mt-1 border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50">
                    {mandors.map((mandor) => (
                        <label key={mandor.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.mandor_ids.includes(mandor.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setData('mandor_ids', [...data.mandor_ids, mandor.id])
                                    } else {
                                        setData('mandor_ids', data.mandor_ids.filter(id => id !== mandor.id))
                                    }
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{mandor.name} ({mandor.whatsapp_number})</span>
                        </label>
                    ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">Pilih satu atau lebih pelaksana untuk proyek ini</p>
                <InputError message={errors.mandor_ids} className="mt-2" />
            </div>

            <div className="mb-4">
                 <InputLabel value="Lokasi Proyek (Teks)" />
                 <TextInput
                    value={data.location}
                    onChange={e => setData('location', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="Contoh: Jl. Sudirman No. 45, Jakarta"
                />
                <InputError message={errors.location} className="mt-2" />
            </div>

            <div className="mb-4">
                <InputLabel value="Koordinat Maps (Opsional)" />
                <TextInput
                    value={data.coordinates}
                    onChange={e => setData('coordinates', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder={'Contoh: -6.1234, 106.1234'}
                />
                <InputError message={errors.coordinates} className="mt-2" />
            </div>

            <div className="mb-4">
                <InputLabel value="Deskripsi (Opsional)" />
                <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows="2"
                    placeholder="Catatan tambahan..."
                />
            </div>

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
                {isEditing ? 'Simpan Perubahan' : 'Buat Proyek'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </BendaharaLayout>
  )
}