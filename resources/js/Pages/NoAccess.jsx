import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function NoAccess({ status = 403 }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <Head title="Akses Belum Diberikan" />
            
            <div className="max-w-xl w-full text-center">
                <div className="relative w-full max-w-sm mx-auto h-64 flex items-center justify-center">
                    <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-50 scale-75"></div>
                    <span className="text-9xl font-black text-yellow-500 select-none">🔒</span>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg border border-yellow-50 border-b-4 border-b-yellow-500 w-max">
                        <span className="text-sm font-bold text-gray-700">Ups, Belum Punya Akses!</span>
                    </div>
                </div>
                
                <h1 className="mt-8 text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
                    Akun Anda Belum Memiliki Akses Panel
                </h1>
                
                <p className="mt-4 text-lg text-gray-500 font-medium px-4">
                    Mohon hubungi <span className="text-indigo-600 font-bold">Superadmin</span> agar akun Anda diberikan hak akses ke panel yang sesuai.
                </p>
                
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Halaman
                    </button>

                    <Link
                         href={route('logout')}
                         method="post"
                         as="button"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar Akun
                    </Link>
                </div>
                
                <div className="mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                   <p>Tidak perlu login ulang, cukup refresh jika akses sudah diberikan.</p>
                </div>
            </div>
        </div>
    );
}
