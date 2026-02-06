import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Error({ status }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    }[status];

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status];

    const Illustration = ({ status }) => {
        if (status === 404) {
            return (
                <div className="relative w-full max-w-sm mx-auto h-64 flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse opacity-50 scale-75"></div>
                    <span className="text-9xl font-black text-indigo-200 select-none">404</span>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg border border-indigo-50 border-b-4 border-b-indigo-500">
                        <span className="text-sm font-bold text-gray-700">Dimana ya? 🤔</span>
                    </div>
                </div>
            );
        }
        if (status === 403) {
            return (
                <div className="relative w-full max-w-sm mx-auto h-64 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-100 rounded-full animate-pulse opacity-50 scale-75"></div>
                    <span className="text-9xl font-black text-rose-200 select-none">403</span>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg border border-rose-50 border-b-4 border-b-rose-500">
                        <span className="text-sm font-bold text-gray-700">Akses Ditolak 🛑</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="relative w-full max-w-sm mx-auto h-64 flex items-center justify-center">
                <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse opacity-50 scale-75"></div>
                <span className="text-9xl font-black text-orange-200 select-none">{status}</span>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg border border-orange-50 border-b-4 border-b-orange-500">
                    <span className="text-sm font-bold text-gray-700">Ada Masalah ⚙️</span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <Head title={title} />
            
            <div className="max-w-xl w-full text-center">
                <Illustration status={status} />
                
                <h1 className="mt-8 text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
                    {title.split(': ')[1]}
                </h1>
                
                <p className="mt-4 text-lg text-gray-500 font-medium">
                    {description}
                </p>
                
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Kembali ke Home
                    </Link>
                    
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Halaman
                    </button>
                </div>
                
                <div className="mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>JKK Panel Bendahara</span>
                    <span>&copy; {new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
    );
}
