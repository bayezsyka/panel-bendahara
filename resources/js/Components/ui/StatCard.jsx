import React from 'react';

/**
 * StatCard — Standardized KPI / metric card.
 *
 * Props:
 * - title: string — metric label
 * - value: string | number — the main number
 * - icon: ReactNode (optional — icon element)
 * - iconBg: string (optional — bg class for icon container, default: "bg-indigo-50")
 * - iconColor: string (optional — text class for icon, default: "text-indigo-600")
 * - trend: { value: string, positive: boolean } (optional)
 * - className: string (optional wrapper classes)
 */
export default function StatCard({
    title,
    value,
    icon,
    iconBg = 'bg-indigo-50',
    iconColor = 'text-indigo-600',
    trend,
    className = '',
}) {
    return (
        <div className={`bg-white dark:bg-[#222238] p-6 rounded-xl border border-gray-200 dark:border-gray-700/40 shadow-sm flex items-center gap-4 ${className}`}>
            {icon && (
                <div className={`flex-shrink-0 p-3 rounded-xl ${iconBg}`}>
                    <div className={`w-6 h-6 ${iconColor}`}>
                        {icon}
                    </div>
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
                {trend && (
                    <p className={`text-xs font-medium mt-1 ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend.positive ? '↑' : '↓'} {trend.value}
                    </p>
                )}
            </div>
        </div>
    );
}
