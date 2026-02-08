import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ message }) {
    return (
        <BendaharaLayout>
            <Head title="Piutang - Clean Slate" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-4">Panel Piutang</h2>
                            <p className="text-gray-600">{message || 'Panel ini telah dibersihkan dan siap untuk dibuat ulang dari awal.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </BendaharaLayout>
    );
}
