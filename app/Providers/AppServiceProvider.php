<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\OfficeContextService::class, function ($app) {
            return new \App\Services\OfficeContextService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force timezone and locale to Asia/Jakarta and Indonesian
        config(['app.timezone' => 'Asia/Jakarta']);
        date_default_timezone_set('Asia/Jakarta');
        \Carbon\Carbon::setLocale('id');
        app()->setLocale('id');

        Vite::prefetch(concurrency: 3);
        Activity::saving(function (Activity $activity) {
            $activity->properties = $activity->properties->merge([
                'ip' => Request::ip(),
                'user_agent' => Request::header('User-Agent'),
            ]);
        });
    }
}
