import React from 'react';

/**
 * Card — Consistent card/panel container.
 *
 * Props:
 * - children: ReactNode
 * - className: string (extra classes)
 * - padding: string (default: 'p-6')
 * - noPadding: boolean (removes padding)
 * - hover: boolean (adds hover effect)
 */
export default function Card({
    children,
    className = '',
    padding = 'p-6',
    noPadding = false,
    hover = false,
}) {
    return (
        <div
            className={`
                bg-white dark:bg-[#222238] rounded-xl border border-gray-200 dark:border-gray-700/40 shadow-sm
                ${!noPadding ? padding : ''}
                ${hover ? 'hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all duration-200' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
