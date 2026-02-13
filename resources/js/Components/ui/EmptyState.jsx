import React from 'react';

/**
 * EmptyState — Consistent empty/no-data display.
 *
 * Props:
 * - icon: ReactNode (optional custom icon)
 * - title: string (default: "Tidak ada data")
 * - description: string (optional supporting text)
 * - action: ReactNode (optional action button)
 * - compact: boolean (less padding, default: false)
 */
export default function EmptyState({
    icon,
    title = 'Tidak ada data',
    description,
    action,
    compact = false,
}) {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16 px-6'}`}>
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                {icon || (
                    <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>
            <h4 className="text-base font-semibold text-gray-900">{title}</h4>
            {description && (
                <p className="text-sm text-gray-500 mt-1.5 max-w-sm">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
