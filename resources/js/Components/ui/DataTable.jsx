import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * DataTable — Single source of truth for all tables.
 *
 * Props:
 * - columns: Array<{ key, label, align?, render?, className? }>
 *     - key: string — maps to row data key (or used for render)
 *     - label: string — column header text
 *     - align: 'left' | 'center' | 'right' (default: 'left')
 *     - render: (row, index) => ReactNode — custom cell renderer
 *     - className: string — extra td class
 * - data: Array<object> — row data
 * - keyField: string — unique key field in data (default: 'id')
 * - emptyMessage: string (default: 'Tidak ada data.')
 * - emptyIcon: ReactNode (optional icon for empty state)
 * - onRowClick: (row) => void (optional — makes rows clickable)
 * - pagination: Laravel pagination links array (optional)
 * - className: string (wrapper classes)
 * - compact: boolean (smaller padding, default: false)
 */
export default function DataTable({
    columns = [],
    data = [],
    keyField = 'id',
    emptyMessage = 'Tidak ada data.',
    emptyIcon,
    onRowClick,
    pagination,
    className = '',
    compact = false,
}) {
    const cellPadding = compact ? 'px-4 py-3' : 'px-6 py-4';
    const headerPadding = compact ? 'px-4 py-2.5' : 'px-6 py-3';

    const alignClass = (align) => {
        if (align === 'right') return 'text-right';
        if (align === 'center') return 'text-center';
        return 'text-left';
    };

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={`${headerPadding} ${alignClass(col.align)} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row[keyField] ?? rowIndex}
                                    className={`
                                        transition-colors duration-150
                                        ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/40' : 'hover:bg-gray-50/50'}
                                    `}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`${cellPadding} ${alignClass(col.align)} text-sm ${col.className || ''}`}
                                        >
                                            {col.render
                                                ? col.render(row, rowIndex)
                                                : <span className="text-gray-700">{row[col.key] ?? '-'}</span>
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-16 text-center"
                                >
                                    <div className="flex flex-col items-center">
                                        {emptyIcon || (
                                            <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        )}
                                        <p className="text-gray-400 font-medium text-sm">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-1">
                    {pagination.map((link, index) => (
                        <div key={index}>
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    className="px-3 py-1.5 rounded-lg text-sm text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
