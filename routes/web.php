<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\Bendahara\DashboardController;
use App\Http\Controllers\Bendahara\ProjectController;
use App\Http\Controllers\Bendahara\ExpenseController;
use App\Http\Controllers\Bendahara\ExpenseRequestController;
use App\Http\Controllers\Superadmin\UserController;

Route::middleware(['auth', 'verified', 'role:superadmin'])
    ->prefix('superadmin')
    ->name('superadmin.')
    ->group(function () {
        // CRUD Users
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::get('/activity-logs', [\App\Http\Controllers\Superadmin\ActivityLogController::class, 'index'])->name('activity_logs.index');
        Route::post('/switch-office', [\App\Http\Controllers\Superadmin\OfficeSwitcherController::class, 'switch'])->name('office.switch');
    });

Route::middleware(['auth', 'verified', 'role:bendahara,superadmin'])
    ->prefix('bendahara')
    ->name('bendahara.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/export-all-pdf', [DashboardController::class, 'exportAllPdf'])->name('export.all.pdf');
        Route::get('/export-by-type-pdf', [DashboardController::class, 'exportByTypePdf'])->name('export.by.type.pdf');
        Route::resource('projects', ProjectController::class);
        Route::get('/expenses/{expense}/print', [ExpenseController::class, 'print'])->name('expenses.print');
        Route::resource('expenses', ExpenseController::class)->only(['store', 'destroy', 'update']);
        Route::get('/projects/{project}/export', [ProjectController::class, 'exportPdf'])->name('projects.export');

        // Review data pengeluaran dari WhatsApp (pending)
        Route::get('/expense-requests', [ExpenseRequestController::class, 'index'])->name('expense_requests.index');
        Route::put('/expense-requests/{expenseRequest}/approve', [ExpenseRequestController::class, 'approve'])->name('expense_requests.approve');
        Route::put('/expense-requests/{expenseRequest}/reject', [ExpenseRequestController::class, 'reject'])->name('expense_requests.reject');

        Route::get('mandors/{mandor}/export-daily', [\App\Http\Controllers\Bendahara\MandorController::class, 'exportDailyExpenses'])->name('mandors.export-daily');
        Route::resource('mandors', \App\Http\Controllers\Bendahara\MandorController::class)
            ->except(['create', 'edit']);

        Route::resource('benderas', \App\Http\Controllers\Bendahara\BenderaController::class)
            ->except(['create', 'show', 'edit']);

        Route::resource('expense-types', \App\Http\Controllers\Bendahara\ExpenseTypeController::class)
            ->except(['create', 'show', 'edit']);

        // PLANT FINANCE ROUTES
        Route::get('/plant/export-pdf', [\App\Http\Controllers\Bendahara\PlantTransactionController::class, 'exportPdf'])->name('plant.export-pdf');
        Route::get('/plant/kas-besar', [\App\Http\Controllers\Bendahara\PlantTransactionController::class, 'kasBesar'])->name('plant.kas-besar');
        Route::get('/plant/kas-kecil', [\App\Http\Controllers\Bendahara\PlantTransactionController::class, 'kasKecil'])->name('plant.kas-kecil');
        Route::resource('plant-transactions', \App\Http\Controllers\Bendahara\PlantTransactionController::class)->only(['store', 'update', 'destroy']);
    });

Route::get('/', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }

    $role = Auth::user()->role;
    if ($role === 'superadmin' || $role === 'bendahara') {
        return redirect()->route('bendahara.dashboard');
    }

    return redirect()->route('dashboard'); // Fallback for other roles
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth'])
    ->prefix('receivable')
    ->name('receivable.')
    ->group(function () {
        // Redacting all routes to clean up the panel
        Route::get('/', function () {
            return Inertia::render('Receivable/Dashboard', [
                'message' => 'Panel Piutang sedang dibersihkan.'
            ]);
        })->name('dashboard');
    });

require __DIR__ . '/auth.php';
