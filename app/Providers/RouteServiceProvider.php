<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;

public static function redirectTo(): string
{
    $user = Auth::user();

    if($user?->hasRole('bendahara')){
        return route('bendahara.dashboard');
    }

    return route('dashboard');
}
