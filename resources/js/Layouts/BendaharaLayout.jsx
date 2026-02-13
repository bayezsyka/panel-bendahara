import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Swal from 'sweetalert2';
import ThemeTransition from '@/Components/ThemeTransition';

export default function BendaharaLayout({ children, header }) {
    const { auth, flash, errors } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [transitionTheme, setTransitionTheme] = useState(null); // 'dark' or 'light'

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = savedTheme === 'dark';
        setIsDarkMode(prefersDark);
        
        // Prevent transition flash on load
        document.documentElement.classList.add('no-transition');
        if (prefersDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Re-enable transitions after a tick
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('no-transition');
            });
        });
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        const targetTheme = newMode ? 'dark' : 'light';
        
        // 1. Start the animation and update local state immediately for feedback
        setTransitionTheme(targetTheme);
        setIsDarkMode(newMode); // Instant toggle feedback
        
        // 2. Wait for the peak of the animation before changing the actual global theme classes
        setTimeout(() => {
            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }, 800);

        // 3. Clear the transition after it finishes
        setTimeout(() => {
            setTransitionTheme(null);
        }, 2200);
    };

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

    // Close user menu when sidebar closes or route changes
    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [route().current()]);

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

    let activePanel = 'finance';
    if (route().current('receivable.*')) {
        activePanel = 'receivable';
    } else if (route().current('kas.*')) {
        activePanel = 'kas';
    } else if (route().current('delivery.*')) {
        activePanel = 'delivery';
    }

    // Helper untuk mengecek link aktif
    const isActive = (routeName) => route().current(routeName);

    // Helper untuk mengecek akses panel
    const canAccessPanel = (panelName) => {
        if (!auth.user) return false;
        if (auth.user.role === 'superadmin') return true; 
        
        // Bendahara Logic
        const allowed = auth.user.allowed_panels || [];
        return allowed.includes(panelName);
    };

    const hasFinanceAccess = canAccessPanel('finance');
    const hasReceivableAccess = canAccessPanel('receivable');
    const hasKasAccess = canAccessPanel('kas') || canAccessPanel('plant_cash');
    const hasDeliveryAccess = true; // Temporary allow all authenticated roles (bendahara/superadmin) as per route middleware

    // --- KOMPONEN LINK SIDEBAR ---
    const SidebarLink = ({ name, routeName, icon, badge }) => (
        <Link
            href={route(routeName)}
            className={`group/link relative flex items-center justify-start px-3 md:px-0 md:pl-[1.15rem] md:pr-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap ${
                isActive(routeName)
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
        >
            {/* Ikon: Ukuran diperkecil untuk proporsi lebih baik */}
            <div className={`flex-shrink-0 w-5 h-5 transition-colors duration-200 ${isActive(routeName) ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400'}`}>
                {icon}
            </div>
            
            {/* Teks: Muncul saat parent di-hover (DESKTOP ONLY) */}
            <span className={`hidden md:block transition-all duration-300 ease-in-out md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs ml-0 md:group-hover:ml-3 whitespace-nowrap overflow-hidden`}>
                {name}
            </span>

            {/* Badge Notification (DESKTOP ONLY) */}
            {badge > 0 && (
                <span className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full transition-opacity duration-200">
                    {badge}
                </span>
            )}

            {/* Teks untuk Mobile (Selalu muncul di mobile) */}
            <span className="md:hidden ml-3">{name}</span>
            {badge > 0 && (
                <span className="md:hidden ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );

    // --- DARK MODE TOGGLE SWITCH ---
    const DarkModeToggle = () => (
        <div className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg">
            <div className="flex items-center">
                {/* Moon/Sun Icon */}
                <div className="relative w-4 h-4 mr-2">
                    {/* Sun Icon */}
                    <svg 
                        className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'} text-amber-500`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {/* Moon Icon */}
                    <svg 
                        className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'} text-indigo-400`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </div>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {isDarkMode ? 'Mode Gelap' : 'Mode Terang'}
                </span>
            </div>
            
            {/* Toggle Switch */}
            <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${
                    isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={isDarkMode}
                aria-label="Toggle dark mode"
                id="dark-mode-toggle"
            >
                <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-lg transform transition-all duration-300 ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                >
                    {/* Tiny icon inside the knob */}
                    <svg 
                        className={`w-2.5 h-2.5 transition-all duration-300 ${isDarkMode ? 'text-indigo-500' : 'text-amber-400'}`} 
                        fill="currentColor" viewBox="0 0 20 20"
                    >
                        {isDarkMode ? (
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        ) : (
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        )}
                    </svg>
                </span>
            </button>
        </div>
    );

    return (
        <div className="h-screen bg-gray-50 dark:bg-[#1a1a2e] text-slate-900 dark:text-slate-100 flex overflow-hidden">
            {/* Full Screen Theme Transition Animation */}
            <ThemeTransition transitionTheme={transitionTheme} />
            
            {/* --- BACKDROP MOBILE --- */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity"
                ></div>
            )}
            
            {/* --- BACKDROP USER MENU (Transparent) --- */}
            {isUserMenuOpen && (
                <div 
                    onClick={() => setIsUserMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                ></div>
            )}

            {/* --- SIDEBAR UTAMA --- */}
            <aside 
                onMouseLeave={() => setIsUserMenuOpen(false)}
                className={`
                    group bg-white dark:bg-[#222238] border-r border-gray-200/60 dark:border-gray-700/40 flex-shrink-0
                    transition-all duration-300 ease-in-out
                    
                    /* MOBILE: Fixed overlay dengan toggle */
                    fixed inset-y-0 left-0 z-50 w-64
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    
                    /* DESKTOP (md): Relative positioning, mendorong konten */
                    md:relative md:translate-x-0
                    md:w-20 md:hover:w-64
                `}
            >
                {/* Header Sidebar (Logo) */}
                <div className="flex items-center h-20 px-4 md:px-0 border-b border-gray-100 dark:border-gray-700/40 overflow-hidden whitespace-nowrap">
                    <Link 
                        href={route(activePanel === 'finance' ? 'projectexpense.overview' : (activePanel === 'kas' ? 'kas.dashboard' : (activePanel === 'delivery' ? 'delivery.customers.index' : 'receivable.index')))} 
                        className="flex items-center justify-start w-full px-4 md:px-0 md:pl-5 transition-all duration-300"
                    >
                        {/* Ikon Logo selalu terlihat */}
                        <div className="flex-shrink-0">
                            <ApplicationLogo className="w-10 h-10 text-indigo-600 dark:text-indigo-400 fill-current" />
                        </div>
                        
                        {/* Teks Logo: Sembunyi saat default, Muncul saat hover */}
                        <div className="flex flex-col transition-all duration-300 ease-in-out md:opacity-0 md:w-0 md:group-hover:opacity-100 md:group-hover:w-auto md:ml-0 md:group-hover:ml-3 overflow-hidden">
                            <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight leading-none">
                                Bendahara<span className="text-indigo-600 dark:text-indigo-400">App</span>
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase mt-0.5 whitespace-nowrap">
                                {activePanel === 'finance' ? 'Panel Keuangan' : (activePanel === 'kas' ? 'Panel Kas' : (activePanel === 'delivery' ? 'Panel Pengiriman' : 'Panel Piutang'))}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Menu Navigasi */}
                <div className="flex flex-col h-[calc(100vh-5rem)]">
                    <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar space-y-1">
                        
                        {/* Label Menu */}
                        <p className="px-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                            {activePanel === 'finance' ? 'Menu Utama' : (activePanel === 'kas' ? 'Menu Kas' : (activePanel === 'delivery' ? 'Menu Pengiriman' : 'Menu Piutang'))}
                        </p>
                        
                        {/* FINANCE PANEL LINKS */}
                        {activePanel === 'finance' && (
                            <>
                                <SidebarLink 
                                    name="Dashboard" 
                                    routeName="projectexpense.overview" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                                />
                                
                                <SidebarLink 
                                    name="Proyek Konstruksi" 
                                    routeName="projectexpense.projects.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                />

                                <SidebarLink 
                                    name="Pelaksana" 
                                    routeName="projectexpense.mandors.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                />

                                <SidebarLink 
                                    name="Bendera" 
                                    routeName="projectexpense.benderas.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                />

                                <SidebarLink 
                                    name="Tipe Biaya" 
                                    routeName="projectexpense.expense-types.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                                />


                            </>
                        )}

                        {/* KAS PANEL LINKS */}
                        {activePanel === 'kas' && (
                            <>
                                <SidebarLink 
                                    name="Dashboard" 
                                    routeName="kas.dashboard" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                                />
                                <SidebarLink 
                                    name="Kas Besar" 
                                    routeName="kas.kas-besar" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                                />
                                <SidebarLink 
                                    name="Kas Kecil" 
                                    routeName="kas.kas-kecil" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                />

                                <div className="pt-4 pb-2 px-3 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 overflow-hidden whitespace-nowrap">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Master Data</p>
                                </div>

                                <SidebarLink 
                                    name="Sumber Dana" 
                                    routeName="kas.sources.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                                />
                                <SidebarLink 
                                    name="Tipe Biaya Kas" 
                                    routeName="kas.expense-types.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                                />
                            </>
                        )}

                        {/* RECEIVABLE PANEL LINKS */}
                        {activePanel === 'receivable' && (
                            <>
                                <SidebarLink 
                                    name="Dashboard" 
                                    routeName="receivable.dashboard" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                                />
                                <SidebarLink 
                                    name="Daftar Piutang" 
                                    routeName="receivable.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                />
                                <SidebarLink 
                                    name="Riwayat Bayar" 
                                    routeName="receivable.payments.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                                />
                            </>
                        )}

                        {/* DELIVERY PANEL LINKS */}
                        {activePanel === 'delivery' && (
                            <>

                                <SidebarLink 
                                    name="Customer" 
                                    routeName="delivery.customers.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                />
                                <SidebarLink 
                                    name="Mutu Beton" 
                                    routeName="delivery.concrete-grades.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.664 0l-.727-2.903a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-2.296 2.296a2 2 0 01-3.411-1.411l.732-2.93a2 2 0 00-.547-1.022l-2.296-2.296a2 2 0 011.411-3.411l2.93.732a2 2 0 001.022-.547l2.296-2.296a2 2 0 013.411 1.411l-.732 2.93a2 2 0 00.547 1.022l2.296 2.296a2 2 0 01-1.411 3.411l-2.93-.732a2 2 0 00-1.022.547l-2.296 2.296a2 2 0 01-3.411-1.411l.732-2.93a2 2 0 00-.547-1.022l-2.296-2.296a2 2 0 011.411-3.411l2.93.732a2 2 0 001.022-.547l2.296-2.296z" /></svg>}
                                />
                                <SidebarLink 
                                    name="Rekap Pengiriman" 
                                    routeName="delivery.shipments.index" 
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                />
                            </>
                        )}
                    </div>

                    {/* USER PROFILE SECTION (Bottom) */}
                    <div className="border-t border-gray-100 dark:border-gray-700/40 p-2 relative z-50">
                         <div className="group">
                             {/* User Button */}
                              <button 
                                 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                 className={`w-full flex items-center justify-start p-2 md:pl-3.5 rounded-xl transition-all duration-200 outline-none ${isUserMenuOpen ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                             >
                                  <div className="flex-shrink-0 relative">
                                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                          {auth.user.name.charAt(0)}
                                      </div>
                                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white dark:border-[#222238] rounded-full"></div>
                                  </div>
                                  <div className="ml-3 md:ml-0 md:group-hover:ml-3 text-left transition-all duration-200 md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs overflow-hidden whitespace-nowrap hidden md:block">
                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{auth.user.name}</p>
                                      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">{auth.user.email}</p>
                                  </div>
                                  <div className="ml-3 text-left md:hidden block">
                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{auth.user.name}</p>
                                      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">{auth.user.email}</p>
                                  </div>
                                  
                                  {/* Chevron Indicator */}
                                  <div className={`ml-auto transition-all duration-300 ease-in-out md:opacity-0 md:max-w-0 md:group-hover:max-w-xs md:group-hover:opacity-100 overflow-hidden ${isUserMenuOpen ? 'md:opacity-100 md:max-w-xs' : ''}`}>
                                     <svg className={`w-4 h-4 ml-2 text-gray-400 dark:text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                  </div>
                              </button>

                             {/* Popover Menu */}
                             <div className={`absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-[#2a2a42] rounded-2xl shadow-[0_0_50px_-12px_rgb(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-gray-700/40 p-2 transition-all duration-200 transform origin-bottom ${isUserMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible translate-y-2'}`}>
                                 {/* Triangle Pointer */}
                                 <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white dark:bg-[#2a2a42] border-b border-r border-gray-100 dark:border-gray-700/40 transform rotate-45"></div>

                                 <div className="space-y-1">
                                     {/* Dark Mode Toggle */}
                                     <DarkModeToggle />

                                     <div className="h-px bg-gray-100 dark:bg-gray-700/40 my-1"></div>

                                     {/* Profil Saya */}
                                     <Link 
                                         href={route('profile.edit')}
                                         className="flex items-center w-full px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                     >
                                         <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                         Profil Saya
                                     </Link>

                                     {/* Superadmin Menu */}
                                     {auth.user.role === 'superadmin' && (
                                         <>
                                             <Link 
                                                 href={route('superadmin.users.index')}
                                                 className="flex items-center w-full px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                             >
                                                 <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                 Kelola User
                                             </Link>
                                             <Link 
                                                 href={route('superadmin.activity_logs.index')}
                                                 className="flex items-center w-full px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                             >
                                                 <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                 Activity Log
                                             </Link>
                                         </>
                                     )}

                                     <div className="h-px bg-gray-100 dark:bg-gray-700/40 my-1"></div>

                                     {/* Pindah Panel Section */}
                                      <div className="px-2 py-1">
                                         <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">Pindah Panel</p>
                                         <div className="grid grid-cols-1 gap-1.5">
                                             {hasFinanceAccess && (
                                                 <Link 
                                                     href={route('projectexpense.overview')}
                                                     className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${activePanel === 'finance' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-[#2a2a42] border-gray-100 dark:border-gray-700/40 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                                                 >
                                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                     <span className="text-xs font-bold">Finance Panel</span>
                                                 </Link>
                                             )}
                                             {hasKasAccess && (
                                                 <Link 
                                                     href={route('kas.dashboard')}
                                                     className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${activePanel === 'kas' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-[#2a2a42] border-gray-100 dark:border-gray-700/40 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                                                 >
                                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                                     <span className="text-xs font-bold">Kas Panel</span>
                                                 </Link>
                                             )}
                                             {hasDeliveryAccess && (
                                                 <Link 
                                                     href={route('delivery.customers.index')}
                                                     className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${activePanel === 'delivery' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-[#2a2a42] border-gray-100 dark:border-gray-700/40 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                                                 >
                                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                     <span className="text-xs font-bold">Delivery Panel</span>
                                                 </Link>
                                             )}
                                             {hasReceivableAccess && (
                                                 <Link 
                                                     href={route('receivable.index')}
                                                     className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${activePanel === 'receivable' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-[#2a2a42] border-gray-100 dark:border-gray-700/40 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                                                 >
                                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                     <span className="text-xs font-bold">Piutang Panel</span>
                                                 </Link>
                                             )}
                                         </div>
                                      </div>

                                     <div className="h-px bg-gray-100 dark:bg-gray-700/40 my-1"></div>

                                     {/* Logout */}
                                     <Link 
                                         href={route('logout')} 
                                         method="post" 
                                         as="button"
                                         className="flex items-center w-full px-3 py-2 text-xs font-medium text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                     >
                                         <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                         Keluar Aplikasi
                                     </Link>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </aside>
            
            {/* --- KONTEN UTAMA --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Konten sekarang akan bergeser otomatis karena sidebar menggunakan relative positioning di desktop */}
                
                {/* Header Mobile */}
                <div className="md:hidden flex items-center justify-between bg-white dark:bg-[#222238] border-b border-gray-200 dark:border-gray-700/40 p-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/30"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
                                {activePanel === 'finance' ? 'Finance Panel' : (activePanel === 'kas' ? 'Kas Panel' : (activePanel === 'delivery' ? 'Delivery Panel' : 'Piutang Panel'))}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider -mt-1 truncate">
                                {auth.current_office?.name}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                        {auth.user.name.charAt(0)}
                    </div>
                </div>

                {/* Top Navbar / Header Desktop */}
                <header className="hidden md:flex bg-white dark:bg-[#222238] border-b border-gray-200 dark:border-gray-700/40 h-14 items-center px-8 justify-between sticky top-0 z-30">
                    {/* Context Indicator & Switcher */}
                    <div></div>

                    {/* Jam di Tengah */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1a1a2e] px-3 py-1.5 rounded-full border border-gray-100/50 dark:border-gray-700/40 shadow-sm">
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
        </div>
    );
}
