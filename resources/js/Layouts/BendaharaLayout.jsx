import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Swal from 'sweetalert2';

export default function BendaharaLayout({ children, header }) {
    const { auth, flash, errors } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Listen for validation errors
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const firstErrorMessage = Object.values(errors)[0];
            Swal.fire({
                icon: 'error',
                title: 'Data Tidak Valid',
                text: firstErrorMessage,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    }, [errors]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    const activePanel = route().current('receivable.*') ? 'receivable' : 'finance';

    // Helper untuk mengecek link aktif
    const isActive = (routeName) => route().current(routeName);

    // --- KOMPONEN LINK SIDEBAR ---
    const SidebarLink = ({ name, routeName, icon, badge }) => (
        <Link
            href={route(routeName)}
            className={`group/link relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap ${
                isActive(routeName)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-600 hover:bg-indigo-50/80 hover:text-indigo-600'
            }`}
        >
            {/* Ikon: Ukuran diperkecil untuk proporsi lebih baik */}
            <div className={`flex-shrink-0 w-5 h-5 transition-colors duration-200 ${isActive(routeName) ? 'text-white' : 'text-gray-500 group-hover/link:text-indigo-600'}`}>
                {icon}
            </div>
            
            {/* Teks: Muncul saat parent di-hover */}
            {/* Menggunakan max-w dan opacity untuk transisi smooth */}
            <span className={`ml-3 transition-all duration-200 ease-in-out md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs`}>
                {name}
            </span>

            {/* Badge Notification */}
            {badge > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm transition-opacity duration-200">
                    {badge}
                </span>
            )}

            {/* Teks untuk Mobile (Selalu muncul di mobile) */}
            <span className="md:hidden ml-3">{name}</span>
            {badge > 0 && (
                <span className="md:hidden ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                    {badge}
                </span>
            )}
        </Link>
    );

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            
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
                    group bg-white border-r border-gray-200/60 shadow-xl flex-shrink-0
                    transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                    
                    /* MOBILE: Fixed overlay dengan toggle */
                    fixed inset-y-0 left-0 z-50 w-64
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    
                    /* DESKTOP (md): Relative positioning, mendorong konten */
                    md:relative md:translate-x-0
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
                                {activePanel === 'finance' ? 'Panel Keuangan' : 'Panel Piutang'}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Menu Navigasi */}
                <div className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-5rem)] custom-scrollbar">
                    
                    {/* Panel Switcher Toggle (Premium Saklar Style) */}
                    <div className="mb-6 px-2 min-h-[40px] flex items-center justify-center">
                        {/* Expanded State (Hover) */}
                        <div className="hidden md:group-hover:block w-full transition-all duration-300">
                             <div className="relative p-1 bg-gray-100 rounded-xl flex items-center border border-gray-200/50">
                                {/* Sliding Background */}
                                <div 
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                        activePanel === 'finance' ? 'left-1' : 'left-[calc(50%+1px)]'
                                    }`}
                                ></div>

                                {/* Finance Option */}
                                <Link 
                                    href={route('bendahara.dashboard')}
                                    className={`relative z-10 flex-1 py-1.5 text-center transition-colors duration-200 ${
                                        activePanel === 'finance' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Finance</span>
                                </Link>

                                {/* Receivable Option */}
                                <Link 
                                    href={route('receivable.dashboard')}
                                    className={`relative z-10 flex-1 py-1.5 text-center transition-colors duration-200 ${
                                        activePanel === 'receivable' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Piutang</span>
                                </Link>
                            </div>
                        </div>

                        {/* Collapsed State (Default) */}
                        <div className="md:block md:group-hover:hidden transition-all duration-200">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
                                {activePanel === 'finance' ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                )}
                            </div>
                        </div>

                        {/* Mobile State (Selalu block dlm mobile flow) */}
                        <div className="md:hidden w-full">
                            {/* Copy of the expanded toggle for mobile */}
                            <div className="relative p-1 bg-gray-100 rounded-xl flex items-center border border-gray-200/50">
                                <div 
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ${
                                        activePanel === 'finance' ? 'left-1' : 'left-[calc(50%+1px)]'
                                    }`}
                                ></div>
                                <Link href={route('bendahara.dashboard')} className={`relative z-10 flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-widest ${activePanel === 'finance' ? 'text-indigo-600' : 'text-gray-400'}`}>Finance</Link>
                                <Link href={route('receivable.dashboard')} className={`relative z-10 flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-widest ${activePanel === 'receivable' ? 'text-indigo-600' : 'text-gray-400'}`}>Piutang</Link>
                            </div>
                        </div>
                    </div>

                    {/* Label Group Menu (Hanya muncul saat hover) */}
                    <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                        {activePanel === 'finance' ? 'Menu Utama' : 'Menu Piutang'}
                    </p>
                    
                    {activePanel === 'finance' ? (
                        <>
                        <>
                            {auth.current_office?.id === 2 ? (
                                <>
                                    <SidebarLink 
                                        name="Dashboard" 
                                        routeName="bendahara.dashboard" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                                    />
                                    <SidebarLink 
                                        name="Kas Besar" 
                                        routeName="bendahara.plant.kas-besar" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                                    />
                                    <SidebarLink 
                                        name="Kas Kecil" 
                                        routeName="bendahara.plant.kas-kecil" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    />
                                    <SidebarLink 
                                        name="Tipe" 
                                        routeName="bendahara.expense-types.index" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                                    />
                                </>
                            ) : (
                                <>
                                    <SidebarLink 
                                        name="Dashboard" 
                                        routeName="bendahara.dashboard" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                                    />
                                    
                                    <SidebarLink 
                                        name="Proyek Konstruksi" 
                                        routeName="bendahara.projects.index" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                    />
                
                                    <SidebarLink 
                                        name="Pelaksana" 
                                        routeName="bendahara.mandors.index" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                    />
                
                                    <SidebarLink 
                                        name="Bendera" 
                                        routeName="bendahara.benderas.index" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                    />
                
                                    <SidebarLink 
                                        name="Tipe Biaya" 
                                        routeName="bendahara.expense-types.index" 
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                                    />
                
                                    <SidebarLink 
                                        name="Pending WhatsApp" 
                                        routeName="bendahara.expense_requests.index"
                                        badge={usePage().props.pending_expense_requests_count}
                                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    />
                                </>
                            )}
                        </>
                        </>
                    ) : (
                        <>
                            <SidebarLink 
                                name="Dashboard" 
                                routeName="receivable.dashboard" 
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            />
                            
                            <SidebarLink 
                                name="Customer" 
                                routeName="receivable.customers.index" 
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            />

                             <SidebarLink 
                                name="Mutu Beton" 
                                routeName="receivable.grades.index" 
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                            />
                        </>
                    )}

                    {/* Menu Khusus Superadmin */}
                    {auth.user.role === 'superadmin' && activePanel === 'finance' && (
                        <>
                            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                                Admin
                            </p>
                            <SidebarLink 
                                name="Kelola User" 
                                routeName="superadmin.users.index" 
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                            />
                            <SidebarLink 
                                name="Aktivitas Log" 
                                routeName="superadmin.activity_logs.index" 
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                        </>
                    )}


                    {/* Divider & Menu Akun */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                            Akun
                        </p>
                        
                        <Link 
                            href={route('profile.edit')}
                            className="group/link flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 overflow-hidden whitespace-nowrap"
                        >
                            <div className="flex-shrink-0 w-5 h-5 text-gray-500 group-hover/link:text-indigo-600 transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="ml-3 transition-all duration-200 md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs">
                                Profil Saya
                            </span>
                             <span className="md:hidden ml-3">Profil Saya</span>
                        </Link>

                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="w-full text-left group/link flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 overflow-hidden whitespace-nowrap"
                        >
                            <div className="flex-shrink-0 w-5 h-5 text-red-400 group-hover/link:text-red-600 transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <span className="ml-3 transition-all duration-200 md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs">
                                Keluar
                            </span>
                            <span className="md:hidden ml-3">Keluar</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* --- KONTEN UTAMA --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Konten sekarang akan bergeser otomatis karena sidebar menggunakan relative positioning di desktop */}
                
                {/* Header Mobile */}
                <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-800 text-sm truncate">
                                {activePanel === 'finance' ? 'Finance Panel' : 'Piutang Panel'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider -mt-1 truncate">
                                {auth.current_office?.name}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {auth.user.name.charAt(0)}
                    </div>
                </div>

                {/* Top Navbar / Header Desktop (Hanya muncul jika ada switcher atau info kantor) */}
                <header className="hidden md:flex bg-white border-b border-gray-200 h-14 items-center px-8 justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Context: <span className="text-gray-900">{auth.current_office?.name}</span>
                        </span>
                    </div>

                    {/* Jam di Tengah */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100/50 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium font-mono">
                                {new Intl.DateTimeFormat('id-ID', {
                                    day: 'numeric',
                                    month: 'long', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                }).format(currentTime)} WIB
                            </span>
                        </div>
                    </div>

                    {auth.can_switch_office && (
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold transition-all hover:bg-indigo-100 border border-indigo-100/50">
                                <span>Ganti Kantor</span>
                                <svg className="w-4 h-4 text-indigo-400 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-2">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Tampilan</p>
                                </div>
                                <Link 
                                    href={route('superadmin.office.switch')} 
                                    method="post" 
                                    data={{ office_id: 1 }}
                                    className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${auth.current_office?.id === 1 ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${auth.current_office?.id === 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                    Kantor Utama (ID 1)
                                </Link>
                                <Link 
                                    href={route('superadmin.office.switch')} 
                                    method="post" 
                                    data={{ office_id: 2 }}
                                    className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${auth.current_office?.id === 2 ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${auth.current_office?.id === 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                    Kantor Plant (ID 2)
                                </Link>
                            </div>
                        </div>
                    )}
                </header>

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


            {/* DEMO MODE INDICATOR */}
            {/* <div className="fixed bottom-4 right-4 z-[100] pointer-events-none select-none">
                <div className="bg-orange-600/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl shadow-2xl border-2 border-white/20 flex items-center gap-3 animate-fade-in-up">
                    <div className="bg-white/20 p-1.5 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                         </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xs uppercase tracking-widest text-orange-100">Mode Demo</span>
                        <span className="text-[10px] font-medium text-white">Data Simulasi & Tidak Permanen</span>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
