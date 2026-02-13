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
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    green:   'bg-green-50 text-green-700 border-green-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red:     'bg-red-50 text-red-700 border-red-100',
    yellow:  'bg-amber-50 text-amber-700 border-amber-100',
    purple:  'bg-purple-50 text-purple-700 border-purple-100',
    indigo:  'bg-indigo-50 text-indigo-700 border-indigo-100',
    gray:    'bg-gray-50 text-gray-600 border-gray-100',
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
