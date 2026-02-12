import React from 'react';
import BendaharaLayout from '@/Layouts/BendaharaLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ projects }) {
    return (
        <BendaharaLayout>
            <Head title="Proyek Pengiriman" />

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Proyek</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Kelola manajemen pengiriman beton per proyek</p>
                    </div>

                </div>

                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col">
                                <Link 
                                    href={route('delivery.projects.show', project.id)}
                                    className="p-6 flex-1"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                                                {project.customer.name}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                                {project.name}
                                            </h3>
                                        </div>
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100">
                                            Running
                                        </span>
                                    </div>
                                    
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-start gap-2.5 text-xs text-gray-500 font-medium">
                                            <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="line-clamp-2">{project.location || 'Lokasi belum diatur'}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.664 0l-.727-2.903a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-2.296 2.296a2 2 0 01-3.411-1.411l.732-2.93a2 2 0 00-.547-1.022l-2.296-2.296a2 2 0 011.411-3.411l2.93.732a2 2 0 001.022-.547" /></svg>
                                            Mutu Default: <span className="text-gray-900 font-bold">{project.default_concrete_grade?.code || '-'}</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Terbaru</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <Link href={route('delivery.projects.edit', project.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider">Edit</Link>
                                        <Link href={route('delivery.projects.show', project.id)} className="text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider">Detail</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Belum Ada Proyek</h4>
                        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto font-medium">Buat proyek pengiriman pertama Anda untuk mulai mencatat riwayat pengiriman beton.</p>

                    </div>
                )}
            </div>
        </BendaharaLayout>
    );
}
