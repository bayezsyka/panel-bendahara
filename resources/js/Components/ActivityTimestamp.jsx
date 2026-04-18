import React, { useEffect, useState } from 'react';

const DEFAULT_TIMEZONE = 'Asia/Jakarta';
const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
const TIMEZONE_LABELS = {
    'Asia/Jakarta': 'WIB',
};
const RELATIVE_STEPS = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
];

function normalizeTimestamp(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const parsed = new Date(value);
        const parts = value.split(' ');

        return {
            iso: Number.isNaN(parsed.getTime()) ? null : parsed.toISOString(),
            display: value,
            date: parts.slice(0, 3).join(' '),
            time: parts.slice(3).join(' '),
            relative: '',
            timezone: DEFAULT_TIMEZONE,
        };
    }

    return value;
}

function formatRelative(iso, fallback = '') {
    if (!iso) {
        return fallback;
    }

    const parsed = new Date(iso);

    if (Number.isNaN(parsed.getTime())) {
        return fallback;
    }

    const diffMs = parsed.getTime() - Date.now();
    const absMs = Math.abs(diffMs);

    if (absMs < 45 * 1000) {
        return 'baru saja';
    }

    for (const [unit, unitMs] of RELATIVE_STEPS) {
        if (absMs >= unitMs || unit === 'minute') {
            return RELATIVE_FORMATTER.format(Math.round(diffMs / unitMs), unit);
        }
    }

    return fallback;
}

function resolveLine(timestamp, line, relativeText) {
    if (!timestamp || !line) {
        return '';
    }

    if (line === 'relative') {
        return relativeText;
    }

    if (line === 'timezone') {
        return TIMEZONE_LABELS[timestamp.timezone] ?? timestamp.timezone ?? DEFAULT_TIMEZONE;
    }

    return timestamp[line] ?? '';
}

export default function ActivityTimestamp({
    value,
    primary = 'display',
    secondary = 'relative',
    className = '',
    primaryClassName = 'text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums whitespace-nowrap',
    secondaryClassName = 'text-[11px] text-gray-400 dark:text-gray-500 mt-0.5',
}) {
    const timestamp = normalizeTimestamp(value);
    const [relativeText, setRelativeText] = useState(() => formatRelative(timestamp?.iso, timestamp?.relative));

    useEffect(() => {
        setRelativeText(formatRelative(timestamp?.iso, timestamp?.relative));

        if (!timestamp?.iso) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setRelativeText(formatRelative(timestamp.iso, timestamp.relative));
        }, 60 * 1000);

        return () => window.clearInterval(intervalId);
    }, [timestamp?.iso, timestamp?.relative]);

    if (!timestamp) {
        return <span className={primaryClassName}>-</span>;
    }

    const primaryText = resolveLine(timestamp, primary, relativeText) || '-';
    const secondaryText = resolveLine(timestamp, secondary, relativeText);

    return (
        <div className={className}>
            <p className={primaryClassName}>{primaryText}</p>
            {secondaryText ? <p className={secondaryClassName}>{secondaryText}</p> : null}
        </div>
    );
}
