import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Swal from 'sweetalert2';

export default function BendaharaLayout({ children, header }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (flash?.message) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.message,
                showConfirmButton: false,
                timer: 1500,
                position: 'center',
                toast: false
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
                showConfirmButton: true,
            });
        }
    }, [flash]);

    // Helper untuk mengecek link aktif
    const isActive = (routeName) => route().current(routeName);

    // --- KOMPONEN LINK SIDEBAR ---
    const SidebarLink = ({ name, routeName, icon }) => (
        <Link
            href={route(routeName)}
            className={`group/link flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                isActive(routeName)
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
        >
            {/* Ikon: Ukuran tetap agar tidak gepeng saat animasi */}
            <div className={`flex-shrink-0 w-6 h-6 transition-colors duration-300 ${isActive(routeName) ? 'text-white' : 'text-gray-400 group-hover/link:text-indigo-600'}`}>
                {icon}
            </div>
            
            {/* Teks: Muncul saat parent di-hover */}
            {/* Menggunakan max-w dan opacity untuk transisi smooth */}
            <span className={`ml-3 transition-all duration-300 ease-in-out md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs`}>
                {name}
            </span>
            
            {/* Teks untuk Mobile (Selalu muncul di mobile) */}
            <span className="md:hidden ml-3">{name}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            
            {/* --- BACKDROP MOBILE --- */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity"
                ></div>
            )}

            {/* --- SIDEBAR UTAMA --- */}
            <aside 
                className={`
                    group fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-sm
                    transform transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                    
                    /* MOBILE: Logic Buka/Tutup Biasa */
                    w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    
                    /* DESKTOP (md): Logic Auto-Hide / Expand on Hover */
                    md:translate-x-0 
                    md:w-20 md:hover:w-72
                `}
            >
                {/* Header Sidebar (Logo) */}
                <div className="flex items-center h-20 px-4 border-b border-gray-100 overflow-hidden whitespace-nowrap">
                    <Link href={route('bendahara.dashboard')} className="flex items-center gap-3">
                        {/* Ikon Logo selalu terlihat */}
                        <div className="flex-shrink-0">
                            <ApplicationLogo className="w-10 h-10 text-indigo-600 fill-current" />
                        </div>
                        
                        {/* Teks Logo: Sembunyi saat default, Muncul saat hover */}
                        <div className="flex flex-col transition-all duration-300 ease-in-out md:opacity-0 md:w-0 md:group-hover:opacity-100 md:group-hover:w-auto">
                            <span className="text-xl font-bold text-gray-800 tracking-tight leading-none">
                                Bendahara<span className="text-indigo-600">App</span>
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">
                                Panel Keuangan
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Menu Navigasi */}
                <div className="p-3 space-y-2 overflow-y-auto h-[calc(100vh-5rem)] scrollbar-hide">
                    {/* Label Group Menu (Hanya muncul saat hover) */}
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                        Menu Utama
                    </p>
                    
                    <SidebarLink 
                        name="Dashboard" 
                        routeName="bendahara.dashboard" 
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                    />
                    
                    <SidebarLink 
                        name="Proyek Konstruksi" 
                        routeName="bendahara.projects.index" 
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    />

                    <SidebarLink 
                        name="Data Mandor" 
                        routeName="bendahara.mandors.index" 
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    />

                    <SidebarLink 
                        name="Pending WhatsApp" 
                        routeName="bendahara.expense_requests.index" 
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />


                    {/* Divider & Menu Akun */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                            Akun
                        </p>
                        
                        <Link 
                            href={route('profile.edit')}
                            className="group/link flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 overflow-hidden whitespace-nowrap"
                        >
                            <div className="flex-shrink-0 w-6 h-6 text-gray-400 group-hover/link:text-indigo-600 transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="ml-3 transition-all duration-300 md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs">
                                Profil Saya
                            </span>
                             <span className="md:hidden ml-3">Profil Saya</span>
                        </Link>

                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="w-full text-left group/link flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300 overflow-hidden whitespace-nowrap"
                        >
                            <div className="flex-shrink-0 w-6 h-6 text-red-400 group-hover/link:text-red-600 transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <span className="ml-3 transition-all duration-300 md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs">
                                Keluar
                            </span>
                            <span className="md:hidden ml-3">Keluar</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* --- KONTEN UTAMA --- */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out md:pl-20">
                {/* md:pl-20 -> Memberikan padding kiri sebesar lebar sidebar saat mode 'tutup' (mini).
                   Saat sidebar di-hover (melebar), dia akan menutupi konten (overlay) tanpa menggesernya,
                   sehingga layout tabel/grafik tidak berantakan/goyang.
                */}
                
                {/* Header Mobile */}
                <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <span className="font-bold text-gray-800">Bendahara Panel</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {auth.user.name.charAt(0)}
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header Slot (Optional) */}
                        {header && (
                            <div className="mb-8">
                                {header}
                            </div>
                        )}

                        <div className="fade-in-up">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
