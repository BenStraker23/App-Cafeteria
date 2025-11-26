<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rutas públicas (sin autenticación)
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas públicas para categorías y productos (para mostrar en la página principal)
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/productos', [ProductoController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Almacenar ordenes
    Route::apiResource('/pedidos', PedidoController::class);
    
    // Ruta específica para cancelar pedidos
    Route::put('/pedidos/{pedido}/cancel', [PedidoController::class, 'cancel']);
    
    Route::apiResource('/categorias', CategoriaController::class)->except(['index']);
    Route::apiResource('/productos', ProductoController::class)->except(['index']);
    
    // Ruta específica para admin - todos los productos
    Route::get('/productos-admin', [ProductoController::class, 'indexAdmin']);
    
    // Rutas de pago
    Route::post('/payment/process', [PaymentController::class, 'processPayment']);
    Route::get('/payment/health', [PaymentController::class, 'checkMicroserviceHealth']);
    Route::get('/pedidos-pagados', [PaymentController::class, 'getPaidOrders']);
});
