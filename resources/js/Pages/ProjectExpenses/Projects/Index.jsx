import React, { useState } from 'react'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import BendaharaLayout from '@/Layouts/BendaharaLayout'
import PageHeader from '@/Components/PageHeader'
import Modal from '@/Components/Modal'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import PrimaryButton from '@/Components/PrimaryButton'
import SecondaryButton from '@/Components/SecondaryButton'
import InputError from '@/Components/InputError'
import { SearchInput, Badge, EmptyState, Select, Card } from '@/Components/ui'

export default function Index({ projects, mandors, benderas }) {
  const { auth } = usePage().props;
  const { can_manage_projects } = auth;
  
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
        const identifier = currentProject.slug || currentProject.id;
        put(route('projectexpense.projects.update', identifier), {
            onSuccess: () => {
                setShowModal(false)
                reset()
            },
        })
    } else {
        post(route('projectexpense.projects.store'), {
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
          backLink={route('projectexpense.overview')}
          backLabel="Dashboard"
          actions={
            can_manage_projects && (
                <PrimaryButton onClick={openCreateModal}>
                    + Buat Proyek
                </PrimaryButton>
            )
          }
        />

        {/* Search */}
        <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari proyek berdasar nama, lokasi, bendera, atau pelaksana..."
            maxWidth="max-w-lg"
        />

        {/* Project Cards Grid */}
        {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <Card key={project.id} noPadding hover className="group flex flex-col overflow-hidden">
                    <Link href={route('projectexpense.projects.show', project.slug || project.id)} className="flex-1 p-5 block">
                        <div className="flex justify-between items-start mb-4">
                            <Badge 
                                variant={project.status === 'ongoing' ? 'blue' : 'green'} 
                                size="md"
                                dot
                            >
                                {project.status === 'ongoing' ? 'Berjalan' : 'Selesai'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                                {new Date(project.created_at).toLocaleDateString('id-ID')}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition">
                            {project.name}
                        </h3>
    
                        {/* Badge Bendera */}
                        {project.bendera && (
                            <Badge variant="purple" size="sm" className="mb-3">
                                🏢 {project.bendera.name}
                            </Badge>
                        )}
                        
                        <div className="space-y-2 mb-2">
                            {/* Tampilkan multiple mandors */}
                            {project.mandors && project.mandors.length > 0 ? (
                                <div className="space-y-1.5">
                                    {project.mandors.map((mandor, idx) => (
                                        <div key={mandor.id} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="font-medium">Pelaksana {idx + 1}: {mandor.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : project.mandor && (
                                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
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
                        <Link href={route('projectexpense.projects.show', project.slug || project.id)} className="text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            Lihat Detail
                        </Link>
                        
                        {can_manage_projects && (
                            <button 
                                onClick={(e) => { e.preventDefault(); openEditModal(project); }}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Proyek
                            </button>
                        )}
                    </div>
                </Card>
              ))}
            </div>
        ) : (
            <Card>
                <EmptyState
                    title={search ? `Tidak ada hasil untuk "${search}"` : "Belum ada proyek"}
                    description={search ? "Coba kata kunci lain." : "Buat proyek pertama untuk memulai pencatatan biaya."}
                    action={!search && can_manage_projects ? (
                        <PrimaryButton onClick={openCreateModal}>+ Buat Proyek</PrimaryButton>
                    ) : null}
                />
            </Card>
        )}
      </div>

      {/* Modal Create/Edit */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={submitProject} className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {isEditing ? 'Edit Proyek' : 'Buat Proyek Baru'}
          </h2>
          
          <div className="space-y-4">
            <div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <InputLabel value="Bendera (PT/CV)" />
                    <Select
                        className="mt-1"
                        value={data.bendera_id}
                        onChange={e => setData('bendera_id', e.target.value)}
                        placeholder="-- Pilih Bendera --"
                        options={benderas.map(b => ({ value: b.id, label: b.name }))}
                    />
                    <InputError message={errors.bendera_id} className="mt-2" />
                </div>
            </div>

            <div>
                <InputLabel value="Pelaksana (Bisa Pilih Lebih dari 1)" />
                <div className="mt-1 border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto bg-gray-50">
                    {mandors.map((mandor) => (
                        <label key={mandor.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
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
                            <span className="text-sm text-gray-700">{mandor.name}</span>
                        </label>
                    ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">Pilih satu atau lebih pelaksana untuk proyek ini</p>
                <InputError message={errors.mandor_ids} className="mt-2" />
            </div>

            <div>
                 <InputLabel value="Lokasi Proyek (Teks)" />
                 <TextInput
                    value={data.location}
                    onChange={e => setData('location', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="Contoh: Jl. Sudirman No. 45, Jakarta"
                />
                <InputError message={errors.location} className="mt-2" />
            </div>

            <div>
                <InputLabel value="Koordinat Maps (Opsional)" />
                <TextInput
                    value={data.coordinates}
                    onChange={e => setData('coordinates', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder={'Contoh: -6.1234, 106.1234'}
                />
                <InputError message={errors.coordinates} className="mt-2" />
            </div>

            <div>
                <InputLabel value="Deskripsi (Opsional)" />
                <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-sm"
                    rows="2"
                    placeholder="Catatan tambahan..."
                />
            </div>

            <div>
                <InputLabel value="Status Proyek" />
                <Select
                    className="mt-1"
                    value={data.status}
                    onChange={e => setData('status', e.target.value)}
                    placeholder=""
                    options={[
                        { value: 'ongoing', label: 'Sedang Berjalan' },
                        { value: 'completed', label: 'Selesai (Completed)' },
                    ]}
                />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <SecondaryButton onClick={() => setShowModal(false)}>Batal</SecondaryButton>
            <PrimaryButton disabled={processing}>
                {processing ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Buat Proyek')}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </BendaharaLayout>
  )
}