<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class ActivityLogTimestamp
{
    private const FALLBACK_TIMEZONE = 'Asia/Jakarta';

    public static function make(?CarbonInterface $timestamp): ?array
    {
        if (!$timestamp) {
            return null;
        }

        $localized = CarbonImmutable::instance($timestamp)
            ->setTimezone(self::timezone())
            ->locale(app()->getLocale());

        return [
            'iso' => $localized->toIso8601String(),
            'display' => $localized->translatedFormat('d M Y H:i:s'),
            'date' => $localized->translatedFormat('d M Y'),
            'time' => $localized->format('H:i:s'),
            'relative' => $localized->diffForHumans(),
            'timezone' => $localized->timezoneName,
        ];
    }

    public static function formatDateString(string $value): string
    {
        try {
            $localized = CarbonImmutable::parse($value, self::timezone())
                ->setTimezone(self::timezone())
                ->locale(app()->getLocale());

            $format = preg_match('/\d{2}:\d{2}/', $value)
                ? 'd M Y H:i'
                : 'd M Y';

            return $localized->translatedFormat($format);
        } catch (\Throwable) {
            return $value;
        }
    }

    public static function timezone(): string
    {
        return config('app.timezone', self::FALLBACK_TIMEZONE);
    }
}
