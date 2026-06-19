<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PhotoSessionController;
use App\Http\Controllers\Api\PublicGalleryController;
use App\Http\Controllers\Api\QuoteController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Public gallery (token-based, no auth)
Route::prefix('public/gallery')->group(function () {
    Route::get('{token}', [PublicGalleryController::class, 'show']);
    Route::post('{token}/favorite/{image}', [PublicGalleryController::class, 'toggleFavorite']);
});

// Protected routes — cualquier usuario autenticado
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('profile', [AuthController::class, 'updateProfile']);
    });
});

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('upcoming-sessions', [DashboardController::class, 'upcomingSessions']);
        Route::get('recent-invoices', [DashboardController::class, 'recentInvoices']);
    });

    // Clients
    Route::apiResource('clients', ClientController::class);
    Route::get('clients/{client}/sessions', [ClientController::class, 'sessions']);

    // Sessions
    Route::apiResource('sessions', PhotoSessionController::class);
    Route::patch('sessions/{photoSession}/status', [PhotoSessionController::class, 'updateStatus']);

    // Quotes
    Route::apiResource('quotes', QuoteController::class);
    Route::patch('quotes/{quote}/status', [QuoteController::class, 'updateStatus']);
    Route::get('quotes/{quote}/pdf', [QuoteController::class, 'pdf']);

    // Invoices
    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::post('invoices', [InvoiceController::class, 'store']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::patch('invoices/{invoice}/status', [InvoiceController::class, 'updateStatus']);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);

    // Galleries
    Route::apiResource('galleries', GalleryController::class);
    Route::post('galleries/{gallery}/images', [GalleryController::class, 'uploadImages']);
    Route::delete('galleries/{gallery}/images/{image}', [GalleryController::class, 'destroyImage']);
});