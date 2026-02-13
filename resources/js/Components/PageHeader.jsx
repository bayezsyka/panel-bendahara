import React from 'react';
import { Link } from '@inertiajs/react';
import Badge from '@/Components/ui/Badge';

/**
 * PageHeader — Consistent page header component.
 * 
 * Props:
 * - title: string (required)
 * - subtitle: string (optional description below title)
 * - backLink: string URL (optional)
 * - backLabel: string (default: "Kembali")
 * - badge: { text, variant } (optional badge next to title)
 * - actions: ReactNode (optional action buttons on the right)
 * - meta: ReactNode | string (optional meta info below title)
 * - icon: LucideIcon component (optional icon before title)
 */
export default function PageHeader({ 
    title, 
    subtitle,
    backLink, 
    backLabel = 'Kembali',
    badge,
    actions,
    meta,
    icon: Icon,
}) {
    return (
        <div className="mb-2">
            {/* Back Link */}
            {backLink && (
                <Link 
                    href={backLink} 
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-3"
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
                    {/* Title with optional icon and badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {Icon && (
                            <div className="flex-shrink-0 p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Icon className="w-5 h-5" />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {title}
                        </h1>
                        {badge && (
                            <Badge variant={badge.variant || 'gray'} size="md">
                                {badge.text}
                            </Badge>
                        )}
                    </div>

                    {/* Optional Subtitle */}
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    )}

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
