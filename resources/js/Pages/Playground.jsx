import React, { useState } from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import { SearchInput, Badge, DataTable, StatCard, EmptyState, Select, Card } from '@/Components/ui';
import { Users, TrendingUp, FileText, Layers } from 'lucide-react';

export default function Playground() {
    const [searchValue, setSearchValue] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [checkboxChecked, setCheckboxChecked] = useState(false);

    // Sample data for DataTable
    const sampleData = [
        { id: 1, name: 'Ahmad Farros', email: 'farros@jkk.co.id', role: 'superadmin', status: true },
        { id: 2, name: 'Budi Santoso', email: 'budi@jkk.co.id', role: 'bendahara', status: true },
        { id: 3, name: 'Citra Dewi', email: 'citra@jkk.co.id', role: 'bendahara', status: false },
    ];

    const columns = [
        {
            key: 'name',
            label: 'Nama',
            render: (row) => (
                <div>
                    <div className="font-semibold text-gray-900">{row.name}</div>
                    <div className="text-xs text-gray-400">UID: {row.id}</div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (row) => <span className="text-gray-600">{row.email}</span>,
        },
        {
            key: 'role',
            label: 'Role',
            render: (row) => (
                <Badge variant={row.role === 'superadmin' ? 'purple' : 'indigo'} size="md">
                    {row.role}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge variant={row.status ? 'emerald' : 'red'} size="md" dot>
                    {row.status ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Aksi',
            align: 'right',
            render: () => (
                <div className="flex justify-end gap-1">
                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <BendaharaLayout>
            <Head title="Component Playground" />

            <div className="space-y-10">
                <PageHeader 
                    title="Component Playground"
                    subtitle="Preview semua komponen Design System yang tersedia."
                    icon={Layers}
                />

                {/* ======== BUTTONS ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Buttons</h2>
                    <div className="flex flex-wrap gap-3 items-center">
                        <PrimaryButton>Primary Button</PrimaryButton>
                        <SecondaryButton>Secondary Button</SecondaryButton>
                        <DangerButton>Danger Button</DangerButton>
                        <PrimaryButton disabled>Disabled</PrimaryButton>
                        <PrimaryButton className="bg-emerald-600 hover:bg-emerald-700">Custom Color</PrimaryButton>
                    </div>
                </section>

                {/* ======== BADGES ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Badges</h2>
                    <div className="flex flex-wrap gap-3 items-center">
                        <Badge variant="blue" size="md">Blue</Badge>
                        <Badge variant="green" size="md">Green</Badge>
                        <Badge variant="emerald" size="md" dot>Emerald + Dot</Badge>
                        <Badge variant="red" size="md">Red</Badge>
                        <Badge variant="yellow" size="md">Yellow</Badge>
                        <Badge variant="purple" size="md">Purple</Badge>
                        <Badge variant="indigo" size="md">Indigo</Badge>
                        <Badge variant="gray" size="md">Gray</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center mt-3">
                        <Badge variant="blue" size="sm">Small Blue</Badge>
                        <Badge variant="red" size="sm" dot>Small + Dot</Badge>
                    </div>
                </section>

                {/* ======== FORM INPUTS ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Form Inputs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div>
                            <InputLabel value="Text Input" />
                            <TextInput className="mt-1 block w-full" placeholder="Ketik sesuatu..." />
                        </div>
                        <div>
                            <InputLabel value="Select" />
                            <Select
                                className="mt-1"
                                value={selectValue}
                                onChange={(e) => setSelectValue(e.target.value)}
                                placeholder="-- Pilih opsi --"
                                options={[
                                    { value: '1', label: 'Opsi Pertama' },
                                    { value: '2', label: 'Opsi Kedua' },
                                    { value: '3', label: 'Opsi Ketiga' },
                                ]}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={checkboxChecked}
                                onChange={(e) => setCheckboxChecked(e.target.checked)}
                            />
                            <InputLabel value="Checkbox Label" className="cursor-pointer" />
                        </div>
                    </div>
                </section>

                {/* ======== SEARCH INPUT ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Search Input</h2>
                    <SearchInput
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Cari komponen..."
                    />
                    {searchValue && (
                        <p className="text-sm text-gray-500 mt-2">Searching for: "{searchValue}"</p>
                    )}
                </section>

                {/* ======== STAT CARDS ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Stat Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <StatCard
                            title="Total Customer"
                            value="125"
                            icon={<Users className="w-6 h-6" />}
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            title="Total Piutang"
                            value="Rp 2.500.000.000"
                            icon={<TrendingUp className="w-6 h-6" />}
                            iconBg="bg-indigo-50"
                            iconColor="text-indigo-600"
                            trend={{ value: '+12% dari bulan lalu', positive: true }}
                        />
                        <StatCard
                            title="Proyek Aktif"
                            value="48"
                            icon={<FileText className="w-6 h-6" />}
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                            trend={{ value: '-3 dari minggu lalu', positive: false }}
                        />
                    </div>
                </section>

                {/* ======== DATA TABLE ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Data Table</h2>
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        emptyMessage="Tidak ada data."
                    />
                </section>

                {/* ======== EMPTY STATE ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Empty State</h2>
                    <Card>
                        <EmptyState
                            title="Belum Ada Proyek"
                            description="Mulai dengan membuat proyek pertama Anda."
                            action={
                                <PrimaryButton>+ Buat Proyek</PrimaryButton>
                            }
                        />
                    </Card>
                </section>

                {/* ======== CARDS ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Card>
                            <h3 className="font-semibold text-gray-900 mb-2">Default Card</h3>
                            <p className="text-sm text-gray-500">Basic card dengan padding dan border standar.</p>
                        </Card>
                        <Card hover>
                            <h3 className="font-semibold text-gray-900 mb-2">Hover Card</h3>
                            <p className="text-sm text-gray-500">Hover untuk melihat efek shadow dan border.</p>
                        </Card>
                        <Card className="bg-indigo-600 border-indigo-600 text-white">
                            <h3 className="font-semibold mb-2">Custom Card</h3>
                            <p className="text-sm text-indigo-100">Card dengan background custom.</p>
                        </Card>
                    </div>
                </section>

                {/* ======== MODAL ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Modal</h2>
                    <PrimaryButton onClick={() => setShowModal(true)}>
                        Buka Modal
                    </PrimaryButton>
                </section>

                {/* ======== PAGE HEADER ======== */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Page Header Variants</h2>
                    <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <PageHeader
                            title="Dengan Back Link"
                            subtitle="Header dengan tombol kembali dan aksi."
                            backLink="#"
                            backLabel="Dashboard"
                            actions={<PrimaryButton>+ Aksi</PrimaryButton>}
                        />
                        <div className="border-t border-gray-200 pt-6">
                            <PageHeader
                                title="Dengan Icon & Badge"
                                icon={Users}
                                badge={{ text: '12 Items', variant: 'indigo' }}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Demo Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Contoh Modal Form</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Nama" />
                            <TextInput className="mt-1 block w-full" placeholder="Masukkan nama..." />
                        </div>
                        <div>
                            <InputLabel value="Email" />
                            <TextInput type="email" className="mt-1 block w-full" placeholder="email@example.com" />
                        </div>
                        <div>
                            <InputLabel value="Kategori" />
                            <Select
                                className="mt-1"
                                value=""
                                onChange={() => {}}
                                placeholder="-- Pilih kategori --"
                                options={[
                                    { value: 'a', label: 'Kategori A' },
                                    { value: 'b', label: 'Kategori B' },
                                ]}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={() => setShowModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton onClick={() => setShowModal(false)}>Simpan</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
