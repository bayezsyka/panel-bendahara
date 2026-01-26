import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Komponen Header Halaman yang Konsisten
 * 
 * Props:
 * - title: Judul halaman (required)
 * - backLink: URL untuk tombol kembali (optional)
 * - backLabel: Label untuk tombol kembali (optional, default: "Kembali")
 * - badge: Object { text, variant } untuk badge di samping title (optional)
 * - actions: JSX untuk action buttons di sebelah kanan (optional)
 * - meta: JSX atau string untuk info tambahan di bawah title (optional)
 */
export default function PageHeader({ 
    title, 
    backLink, 
    backLabel = 'Kembali',
    badge,
    actions,
    meta 
}) {
    const badgeVariants = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        yellow: 'bg-amber-50 text-amber-700 border-amber-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        gray: 'bg-gray-50 text-gray-600 border-gray-200',
    };

    return (
        <div className="mb-8">
            {/* Back Link */}
            {backLink && (
                <Link 
                    href={backLink} 
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-3"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {backLabel}
                </Link>
            )}

            {/* Main Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    {/* Title with optional badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {title}
                        </h1>
                        {badge && (
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${badgeVariants[badge.variant] || badgeVariants.gray}`}>
                                {badge.text}
                            </span>
                        )}
                    </div>

                    {/* Optional Meta Info */}
                    {meta && (
                        <div className="mt-1 text-sm text-gray-500">
                            {meta}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {actions && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
