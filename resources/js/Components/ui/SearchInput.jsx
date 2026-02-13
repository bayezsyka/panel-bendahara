import React from 'react';

/**
 * SearchInput — Single source of truth for all search bars.
 *
 * Props:
 * - value: string
 * - onChange: (value: string) => void
 * - placeholder: string (default: "Cari...")
 * - className: string (additional wrapper classes)
 * - maxWidth: string (default: "max-w-md")
 */
export default function SearchInput({
    value,
    onChange,
    placeholder = 'Cari...',
    className = '',
    maxWidth = 'max-w-md',
}) {
    return (
        <div className={`relative ${maxWidth} ${className}`}>
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>

            <input
                type="text"
                className="block w-full pl-10 pr-9 py-2.5 border border-gray-200 dark:border-gray-700/40 rounded-lg text-sm bg-white dark:bg-[#2a2a3d] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            {/* Clear button */}
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
