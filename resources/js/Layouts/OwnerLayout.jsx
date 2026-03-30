import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeTransition from '@/Components/ThemeTransition';

export default function OwnerLayout({ children, header }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen]         = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen]   = useState(false);
    const [currentTime, setCurrentTime]         = useState(new Date());
    const [isDarkMode, setIsDarkMode]           = useState(false);
    const [transitionTheme, setTransitionTheme] = useState(null);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = savedTheme === 'dark';
        setIsDarkMode(prefersDark);
        document.documentElement.classList.add('no-transition');
        if (prefersDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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
        setTransitionTheme(targetTheme);
        setIsDarkMode(newMode);
        setTimeout(() => {
            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }, 800);
        setTimeout(() => { setTransitionTheme(null); }, 2200);
    };

    // Close user menu on route change
    useEffect(() => { setIsUserMenuOpen(false); }, [route().current()]);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => { setCurrentTime(new Date()); }, 1000);
        return () => clearInterval(timer);
    }, []);

    const isActive = (routeName) => route().current(routeName);

    // ── Global Search (inline in topbar, same as before) ──────────────────────
    const GlobalSearchBar = () => {
        const [query, setQuery]     = useState('');
        const [results, setResults] = useState([]);
        const [isOpen, setIsOpen]   = useState(false);
        const [loading, setLoading] = useState(false);
        const [total, setTotal]     = useState(0);
        const inputRef = useRef(null);
        const wrapRef  = useRef(null);
        const timerRef = useRef(null);

        useEffect(() => {
            const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false); };
            document.addEventListener('mousedown', h);
            return () => document.removeEventListener('mousedown', h);
        }, []);

        useEffect(() => {
            const h = (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); setIsOpen(true); }
                if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
            };
            document.addEventListener('keydown', h);
            return () => document.removeEventListener('keydown', h);
        }, []);

        const doSearch = useCallback(async (q) => {
            if (q.trim().length < 2) { setResults([]); setTotal(0); setIsOpen(false); return; }
            setLoading(true);
            try {
                const res  = await fetch(route('owner.search') + '?q=' + encodeURIComponent(q), {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                const data = await res.json();
                setResults(data.results ?? []);
                setTotal(data.total ?? 0);
                setIsOpen(true);
            } catch { setResults([]); } finally { setLoading(false); }
        }, []);

        const handleChange = (e) => {
            const val = e.target.value;
            setQuery(val);
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => doSearch(val), 320);
        };

        const TYPE_COLORS = {
            project:  'text-indigo-500 bg-indigo-50',
            customer: 'text-blue-500 bg-blue-50',
            expense:  'text-orange-500 bg-orange-50',
            shipment: 'text-teal-500 bg-teal-50',
        };

        return (
            <div ref={wrapRef} className="relative w-full max-w-sm">
                <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20 transition-all">
                    {loading
                        ? <svg className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        : <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    }
                    <input
                        ref={inputRef}
                        id="owner-global-search"
                        type="text"
                        value={query}
                        onChange={handleChange}
                        onFocus={() => query.length >= 2 && setIsOpen(true)}
                        placeholder="Cari proyek, customer… (Ctrl+K)"
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 min-w-0"
                        autoComplete="off"
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    )}
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-[999] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                {total > 0 ? `${total} hasil` : 'Tidak ada hasil'}
                            </span>
                            <span className="text-[10px] text-gray-300">Esc untuk tutup</span>
                        </div>
                        {results.length === 0 && !loading && (
                            <div className="px-4 py-6 text-center text-sm text-gray-400">Tidak ada hasil untuk &ldquo;{query}&rdquo;</div>
                        )}
                        <div className="max-h-72 overflow-y-auto">
                            {results.map((group) => (
                                <div key={group.type}>
                                    <div className="px-4 pt-3 pb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.group}</p>
                                    </div>
                                    {group.items.map((item) => (
                                        <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-default transition-colors group/item">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type] ?? 'text-gray-500 bg-gray-100'}`}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.label}</p>
                                                <p className="text-xs text-gray-400 truncate">{item.meta}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-300 group-hover/item:text-indigo-500 transition-colors flex-shrink-0">Lihat →</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-[10px] text-gray-400">
                            <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-[9px]">Esc</kbd> tutup
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ── KOMPONEN LINK SIDEBAR (exact copy from BendaharaLayout) ───────────────
    const SidebarLink = ({ name, routeName, icon, isSub = false }) => (
        <Link
            href={route(routeName)}
            className={`group/link relative flex items-center justify-start px-3 md:px-0 md:pl-[1.15rem] md:pr-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap ${isActive(routeName)
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
        >
            <div className={`flex-shrink-0 w-5 h-5 transition-colors duration-200 ${isActive(routeName) ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400'}`}>
                {icon}
            </div>
            {/* Desktop: hidden until sidebar hover */}
            <span className={`hidden md:block transition-all duration-300 ease-in-out md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs ml-0 md:group-hover:ml-3 whitespace-nowrap overflow-hidden ${isSub ? 'text-[13px]' : ''}`}>
                {name}
            </span>
            {/* Mobile: always visible */}
            <span className={`md:hidden ml-3 ${isSub ? 'text-[13px]' : ''}`}>{name}</span>
        </Link>
    );

    // ── PDF ANCHOR LINK (same style as SidebarLink) ──────────────────────────
    const PdfLink = ({ name, href }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link relative flex items-center justify-start px-3 md:px-0 md:pl-[1.15rem] md:pr-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
            <div className="flex-shrink-0 w-5 h-5 transition-colors duration-200 text-gray-500 dark:text-gray-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <span className="hidden md:block transition-all duration-300 ease-in-out md:opacity-0 md:max-w-0 md:group-hover:opacity-100 md:group-hover:max-w-xs ml-0 md:group-hover:ml-3 whitespace-nowrap overflow-hidden">
                {name}
            </span>
            <span className="md:hidden ml-3">{name}</span>
        </a>
    );

    // ── DARK MODE TOGGLE (exact copy from BendaharaLayout) ────────────────────
    const DarkModeToggle = () => (
        <div className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg">
            <div className="flex items-center">
                <div className="relative w-4 h-4 mr-2">
                    <svg className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <svg className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'} text-indigo-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </div>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {isDarkMode ? 'Mode Gelap' : 'Mode Terang'}
                </span>
            </div>
            <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}
                role="switch"
                aria-checked={isDarkMode}
                aria-label="Toggle dark mode"
                id="dark-mode-toggle"
            >
                <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-lg transform transition-all duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}>
                    <svg className={`w-2.5 h-2.5 transition-all duration-300 ${isDarkMode ? 'text-indigo-500' : 'text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        {isDarkMode
                            ? <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            : <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        }
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
                />
            )}

            {/* --- BACKDROP USER MENU (Transparent) --- */}
            {isUserMenuOpen && (
                <div
                    onClick={() => setIsUserMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside
                onMouseLeave={() => setIsUserMenuOpen(false)}
                className={`
                    group bg-white dark:bg-[#222238] border-r border-gray-200/60 dark:border-gray-700/40 flex-shrink-0
                    transition-all duration-300 ease-in-out

                    fixed inset-y-0 left-0 z-50 w-64
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}

                    md:relative md:translate-x-0
                    md:w-20 md:hover:w-64
                `}
            >
                {/* Header Sidebar (Logo) */}
                <div className="flex items-center h-20 px-4 md:px-0 border-b border-gray-100 dark:border-gray-700/40 overflow-hidden whitespace-nowrap">
                    <Link
                        href={route('owner.dashboard')}
                        className="flex items-center justify-start w-full px-4 md:px-0 md:pl-5 transition-all duration-300"
                    >
                        <div className="flex-shrink-0">
                            <ApplicationLogo className="w-10 h-10 text-indigo-600 dark:text-indigo-400 fill-current" />
                        </div>
                        <div className="flex flex-col transition-all duration-300 ease-in-out md:opacity-0 md:w-0 md:group-hover:opacity-100 md:group-hover:w-auto md:ml-0 md:group-hover:ml-3 overflow-hidden">
                            <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight leading-none">
                                Owner<span className="text-indigo-600 dark:text-indigo-400">App</span>
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase mt-0.5 whitespace-nowrap">
                                Panel Pemilik
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Menu Navigasi */}
                <div className="flex flex-col h-[calc(100vh-5rem)]">
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 [&::-webkit-scrollbar]:w-0 group-hover:[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full" style={{scrollbarWidth:'none'}}>

                        {/* Section: Ringkasan */}
                        <div className="pt-1 pb-2 px-3 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 overflow-hidden whitespace-nowrap">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ringkasan</p>
                        </div>
                        <SidebarLink
                            name="Dashboard"
                            routeName="owner.dashboard"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        />

                        {/* Section: Laporan Keuangan */}
                        <div className="pt-4 pb-2 px-3 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 overflow-hidden whitespace-nowrap">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Laporan Keuangan</p>
                        </div>
                        <SidebarLink
                            name="Kas Harian"
                            routeName="owner.kas"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                        />
                        <SidebarLink
                            name="Proyek Konstruksi"
                            routeName="owner.proyek"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                        />
                        <SidebarLink
                            name="Piutang & Tagihan"
                            routeName="owner.piutang"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <SidebarLink
                            name="Pengiriman & Armada"
                            routeName="owner.pengiriman"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h1m-1-4h11m0 0l-3-3m3 3l-3 3" /></svg>}
                        />

                        {/* Section: Unduh PDF */}
                        <div className="pt-4 pb-2 px-3 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 overflow-hidden whitespace-nowrap">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Unduh PDF</p>
                        </div>
                        <PdfLink name="Rekap Proyek" href={route('owner.reports.laporan-proyek')} />
                        <PdfLink name="Kas Besar"    href={route('owner.reports.laporan-kas') + '?cash_type=kas_besar'} />
                        <PdfLink name="Kas Kecil"    href={route('owner.reports.laporan-kas') + '?cash_type=kas_kecil'} />
                        <PdfLink name="Piutang"      href={route('owner.reports.laporan-piutang')} />

                        {/* Section: Sistem */}
                        <div className="pt-4 pb-2 px-3 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 overflow-hidden whitespace-nowrap">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sistem</p>
                        </div>
                        <SidebarLink
                            name="Jejak Audit"
                            routeName="owner.audit-log"
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                        />
                    </div>

                    {/* USER PROFILE SECTION (Bottom) — exact copy from BendaharaLayout */}
                    <div className="border-t border-gray-100 dark:border-gray-700/40 p-2 relative z-50">
                        <div className="group">
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
                                <div className={`ml-auto transition-all duration-300 ease-in-out md:opacity-0 md:max-w-0 md:group-hover:max-w-xs md:group-hover:opacity-100 overflow-hidden ${isUserMenuOpen ? 'md:opacity-100 md:max-w-xs' : ''}`}>
                                    <svg className={`w-4 h-4 ml-2 text-gray-400 dark:text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                </div>
                            </button>

                            {/* Popover Menu */}
                            <div className={`absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-[#2a2a42] rounded-2xl shadow-[0_0_50px_-12px_rgb(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-gray-700/40 p-2 transition-all duration-200 transform origin-bottom ${isUserMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible translate-y-2'}`}>
                                <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white dark:bg-[#2a2a42] border-b border-r border-gray-100 dark:border-gray-700/40 transform rotate-45"></div>
                                <div className="space-y-1">
                                    <DarkModeToggle />
                                    <div className="h-px bg-gray-100 dark:bg-gray-700/40 my-1"></div>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center w-full px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Profil Saya
                                    </Link>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700/40 my-1"></div>
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
                            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">Owner Dashboard</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider -mt-1">Panel Pemilik</span>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                        {auth.user.name.charAt(0)}
                    </div>
                </div>

                {/* Top Navbar / Header Desktop */}
                <header className="hidden md:flex bg-white dark:bg-[#222238] border-b border-gray-200 dark:border-gray-700/40 h-14 items-center px-8 justify-between sticky top-0 z-30">
                    {/* Search bar (kiri) */}
                    <div className="w-72">
                        <GlobalSearchBar />
                    </div>

                    {/* Jam di tengah */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1a1a2e] px-3 py-1.5 rounded-full border border-gray-100/50 dark:border-gray-700/40 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium font-mono">
                                {new Intl.DateTimeFormat('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                                }).format(currentTime)} WIB
                            </span>
                        </div>
                    </div>

                    {/* Spacer kanan (kosong, simetris) */}
                    <div className="w-72"></div>
                </header>

                <main className="flex-1 overflow-y-auto py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {header && (
                            <div className="mb-8">{header}</div>
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
