<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\ProjectExpenses\OverviewController;
use App\Http\Controllers\ProjectExpenses\ProjectController;
use App\Http\Controllers\ProjectExpenses\ExpenseController;
use App\Http\Controllers\ProjectExpenses\ExpenseRequestController;
use App\Http\Controllers\ProjectExpenses\MandorController;
use App\Http\Controllers\ProjectExpenses\BenderaController;
use App\Http\Controllers\ProjectExpenses\ExpenseTypeController;
use App\Http\Controllers\Superadmin\UserController;
use App\Http\Controllers\Bendahara\PlantTransactionController;
use App\Http\Controllers\Bendahara\CashSourceController;
use App\Http\Controllers\Bendahara\CashExpenseTypeController;
use App\Http\Controllers\Delivery\ConcreteGradeController;
use App\Http\Controllers\Delivery\CustomerController;
use App\Http\Controllers\Delivery\ProjectController as DeliveryProjectController;
use App\Http\Controllers\Delivery\ShipmentController;
use App\Http\Controllers\Receivable\ReceivableController;

Route::middleware(['auth', 'verified', 'role:superadmin'])
    ->prefix('superadmin')
    ->name('superadmin.')
    ->group(function () {
        // CRUD Users
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::get('/activity-logs', [\App\Http\Controllers\Superadmin\ActivityLogController::class, 'index'])->name('activity_logs.index');
        Route::post('/switch-office', [\App\Http\Controllers\Superadmin\OfficeSwitcherController::class, 'switch'])->name('office.switch');
    });

// PROJECT EXPENSES MODULAR ROUTES
Route::middleware(['auth', 'verified', 'role:bendahara,superadmin', 'check.plant.access'])
    ->prefix('projectexpense')
    ->name('projectexpense.')
    ->group(function () {
        Route::get('/', [OverviewController::class, 'index'])->name('overview');
        Route::get('/export-all-pdf', [OverviewController::class, 'exportAllPdf'])->name('export.all.pdf');
        Route::get('/export-by-type-pdf', [OverviewController::class, 'exportByTypePdf'])->name('export.by.type.pdf');

        Route::resource('projects', ProjectController::class);
        Route::get('/projects/{project}/export', [ProjectController::class, 'exportPdf'])->name('projects.export');

        Route::get('/expenses/{expense}/print', [ExpenseController::class, 'print'])->name('expenses.print');
        Route::resource('expenses', ExpenseController::class)->only(['store', 'destroy', 'update']);

        Route::get('/expense-requests', [ExpenseRequestController::class, 'index'])->name('expense-requests.index');
        Route::put('/expense-requests/{expenseRequest}/approve', [ExpenseRequestController::class, 'approve'])->name('expense-requests.approve');
        Route::put('/expense-requests/{expenseRequest}/reject', [ExpenseRequestController::class, 'reject'])->name('expense-requests.reject');

        Route::get('mandors/{mandor}/export-daily', [MandorController::class, 'exportDailyExpenses'])->name('mandors.export-daily');
        Route::resource('mandors', MandorController::class)->except(['create', 'edit']);

        Route::resource('benderas', BenderaController::class)->except(['create', 'show', 'edit']);

        Route::resource('expense-types', ExpenseTypeController::class)->except(['create', 'show', 'edit']);
    });

// KAS PANEL ROUTES
Route::middleware(['auth', 'verified', 'role:bendahara,superadmin'])
    ->prefix('kas')
    ->name('kas.')
    ->group(function () {
        Route::get('/', [PlantTransactionController::class, 'dashboard'])->name('dashboard');

        // Placeholder routes to prevent Ziggy checks from breaking if frontend still references them
        // Kas Routes
        Route::get('/kas-besar', [PlantTransactionController::class, 'kasBesar'])->name('kas-besar');
        Route::get('/kas-kecil', [PlantTransactionController::class, 'kasKecil'])->name('kas-kecil');

        // Master Data Kas
        Route::resource('sources', CashSourceController::class)->names('sources');
        Route::resource('expense-types', CashExpenseTypeController::class)->names('expense-types');

        Route::get('/export-pdf', function () {
            return redirect()->route('kas.dashboard');
        })->name('export-pdf');

        // Transaction CRUD placeholders
        // Transaction CRUD
        Route::post('/transactions', [PlantTransactionController::class, 'store'])->name('transactions.store');
        Route::put('/transactions/{plantTransaction}', [PlantTransactionController::class, 'update'])->name('transactions.update');
        Route::delete('/transactions/{plantTransaction}', [PlantTransactionController::class, 'destroy'])->name('transactions.destroy');
        Route::post('/transfer', [PlantTransactionController::class, 'transfer'])->name('transfer');
    });

Route::get('/', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }

    /** @var \App\Models\User $user */
    $user = Auth::user();
    return redirect()->route($user->getHomeRoute());
});

Route::get('/no-access', function () {
    if (Auth::check()) {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $route = $user->getHomeRoute();
        if ($route !== 'no.access') {
            return redirect()->route($route);
        }
    } else {
        return redirect()->route('login');
    }
    return Inertia::render('NoAccess');
})->name('no.access');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'role:bendahara,superadmin'])
    ->prefix('receivable')
    ->name('receivable.')
    ->group(function () {
        Route::get('/', [ReceivableController::class, 'dashboard'])->name('dashboard');
        Route::get('/list', [ReceivableController::class, 'index'])->name('index');
        Route::get('/payments', [ReceivableController::class, 'payments'])->name('payments.index');
        Route::get('/customer/{customer}', [ReceivableController::class, 'showCustomer'])->name('customer.show');
        Route::get('/project/{project}', [ReceivableController::class, 'showProject'])->name('project.show');
        Route::post('/project/{project}/payment', [ReceivableController::class, 'storePayment'])->name('project.payment.store');
        Route::get('/project/{project}/export-invoice', [ReceivableController::class, 'exportInvoice'])->name('project.export-invoice');
    });

// DELIVERY PANEL ROUTES
Route::middleware(['auth', 'verified', 'role:bendahara,superadmin'])
    ->prefix('delivery')
    ->name('delivery.')
    ->group(function () {
        Route::resource('concrete-grades', ConcreteGradeController::class);
        Route::resource('customers', CustomerController::class);
        Route::get('projects/{project}/export-recap-pdf', [DeliveryProjectController::class, 'exportRecapPdf'])->name('projects.export-recap-pdf');
        Route::resource('projects', DeliveryProjectController::class);
        Route::resource('shipments', ShipmentController::class);
    });

require __DIR__ . '/auth.php';
