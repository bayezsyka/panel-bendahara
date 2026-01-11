import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'

export default function BendaharaLayout({ children }) {
  const { auth } = usePage().props
  const currentPath = usePage().url
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/bendahara/dashboard', label: 'Dashboard' },
    { href: '/bendahara/projects', label : 'Proyek'},
  ]

  const isActive = (href) => currentPath.startsWith(href)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">Bendahara</span>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Desktop user info */}
            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <span className="text-sm text-gray-600">{auth?.user?.name}</span>
              <Link
                href="/logout"
                method="post"
                as="button"
                className="text-sm text-red-600 hover:text-red-800"
              >
                Keluar
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.href)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="px-3 py-2 text-sm text-gray-500">{auth?.user?.email}</div>
                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Keluar
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* User info */}
              <div className="pb-4 mb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                    {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{auth?.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{auth?.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(link.href)
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Keluar
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
