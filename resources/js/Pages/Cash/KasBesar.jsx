import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head } from '@inertiajs/react';

export default function KasBesar({ title }) {
    return (
        <BendaharaLayout>
            <Head title={title} />
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
                <p className="text-gray-500">Panel Kas Besar sedang dibersihkan dan belum aktif.</p>
            </div>
        </BendaharaLayout>
    );
}
