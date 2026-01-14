<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\Bendahara\DashboardController;
use App\Http\Controllers\Bendahara\ProjectController;
use App\Http\Controllers\Bendahara\ExpenseController;


Route::middleware(['auth', 'verified', 'role:bendahara'])
    ->prefix('bendahara')
    ->name('bendahara.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('projects', ProjectController::class);
        Route::resource('expenses', ExpenseController::class)->only(['store', 'destroy']);
        Route::get('/projects/{project}/export', [ProjectController::class, 'exportPdf'])->name('projects.export');
    });

Route::get('/', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }

    return redirect()->route('bendahara.dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
