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


Route::middleware(['auth', 'verified', 'role:bendahara'])
    ->prefix('bendahara')
    ->name('bendahara.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/export-all-pdf', [DashboardController::class, 'exportAllPdf'])->name('export.all.pdf');
        Route::resource('projects', ProjectController::class);
        Route::resource('expenses', ExpenseController::class)->only(['store', 'destroy']);
        Route::get('/projects/{project}/export', [ProjectController::class, 'exportPdf'])->name('projects.export');

        // Review data pengeluaran dari WhatsApp (pending)
        Route::get('/expense-requests', [ExpenseRequestController::class, 'index'])->name('expense_requests.index');
        Route::put('/expense-requests/{expenseRequest}/approve', [ExpenseRequestController::class, 'approve'])->name('expense_requests.approve');
        Route::put('/expense-requests/{expenseRequest}/reject', [ExpenseRequestController::class, 'reject'])->name('expense_requests.reject');

        Route::resource('mandors', \App\Http\Controllers\Bendahara\MandorController::class)
            ->except(['create', 'show', 'edit']); // Kita pakai modal, jadi tidak butuh halaman create/edit terpisah
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


//coba cek
Route::get('/test-gemini', function () {
    $service = new \App\Services\GeminiReceiptService();

    // INI BASE64 JPEG ASLI (1x1 Pixel Putih)
    $validJpegBase64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwf5ip//2Q==";

    $result = $service->analyzeReceipt($validJpegBase64);

    // Debugging: Jika null, kita cek log error terakhir
    if (is_null($result)) {
        return [
            'status' => 'Gagal',
            'pesan' => 'Cek storage/logs/laravel.log untuk detail errornya.',
            'api_key' => substr(env('GEMINI_API_KEY'), 0, 5) . '...', // Cek apakah key terbaca
        ];
    }

    return [
        'status' => 'Berhasil!',
        'hasil_ai' => $result,
    ];
});

require __DIR__ . '/auth.php';
