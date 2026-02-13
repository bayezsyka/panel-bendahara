import React from 'react';

/**
 * Badge — Unified status/category pill.
 *
 * Props:
 * - variant: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray' | 'emerald'
 * - size: 'sm' | 'md' (default: 'sm')
 * - children: ReactNode
 * - className: string (additional classes)
 * - dot: boolean (show status dot before text)
 */

const VARIANTS = {
    blue:    'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    green:   'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    red:     'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/20',
    yellow:  'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    purple:  'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-500/20',
    indigo:  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    gray:    'bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-500/20',
};

const DOT_COLORS = {
    blue:    'bg-blue-500',
    green:   'bg-green-500',
    emerald: 'bg-emerald-500',
    red:     'bg-red-500',
    yellow:  'bg-amber-500',
    purple:  'bg-purple-500',
    indigo:  'bg-indigo-500',
    gray:    'bg-gray-400',
};

const SIZES = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
    variant = 'gray',
    size = 'sm',
    children,
    className = '',
    dot = false,
}) {
    return (
        <span
            className={`
                inline-flex items-center gap-1.5 font-semibold rounded-full border
                ${VARIANTS[variant] || VARIANTS.gray}
                ${SIZES[size] || SIZES.sm}
                ${className}
            `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[variant] || DOT_COLORS.gray}`} />
            )}
            {children}
        </span>
    );
}
