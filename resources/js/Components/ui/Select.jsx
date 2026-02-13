import React from 'react';

/**
 * Select — Consistent styled select dropdown.
 *
 * Props:
 * - value: string | number
 * - onChange: (e) => void
 * - options: Array<{ value, label }>
 * - placeholder: string (default option text)
 * - className: string
 * - required: boolean
 * - disabled: boolean
 * - id: string
 */
export default function Select({
    value,
    onChange,
    options = [],
    placeholder = '-- Pilih --',
    className = '',
    required = false,
    disabled = false,
    id,
    ...props
}) {
    return (
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`
                block w-full rounded-lg border-gray-300 dark:border-gray-700/40 shadow-sm
                text-sm text-gray-700 dark:text-gray-200
                bg-white dark:bg-[#2a2a3d]
                focus:border-indigo-500 focus:ring-indigo-500
                disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                ${className}
            `}
            {...props}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
