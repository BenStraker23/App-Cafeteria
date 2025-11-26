<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoProducto;
use App\Http\Resources\PedidoCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PaymentController extends Controller
{
    private $microserviceUrl = 'http://127.0.0.1:5001/api/payment';

    /**
     * Procesar pago y crear pedido
     */
    public function processPayment(Request $request)
    {
        // Log para debugging
        Log::info('Payment request received', [
            'all_data' => $request->all(),
            'user_id' => Auth::id()
        ]);

        $request->validate([
            'payment_data' => 'required|array',
            'payment_data.pan' => 'required|string',
            'payment_data.exp_mm' => 'required|string|size:2',
            'payment_data.exp_yy' => 'required|string|size:2',
            'payment_data.cvv' => 'required|string|size:3',
            'payment_data.holder_name' => 'required|string',
            'payment_data.amount' => 'required|numeric|min:0.01',
            'productos' => 'required|array|min:1',
            'productos.*.id' => 'required|integer|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0.01'
        ]);

        try {
            // Validar disponibilidad de productos antes del pago
            $productosAgotados = [];
            $productosValidos = [];
            
            foreach ($request->productos as $productoPedido) {
                $producto = \App\Models\Producto::find($productoPedido['id']);
                
                if (!$producto || !$producto->disponible) {
                    $productosAgotados[] = [
                        'id' => $productoPedido['id'],
                        'nombre' => $producto ? $producto->nombre : 'Producto desconocido'
                    ];
                } else {
                    $productosValidos[] = $productoPedido;
                }
            }
            
            // Si hay productos agotados, rechazar la transacción
            if (count($productosAgotados) > 0) {
                $nombresAgotados = collect($productosAgotados)->pluck('nombre')->join(', ');
                
                Log::warning('Payment rejected due to unavailable products', [
                    'user_id' => Auth::id(),
                    'unavailable_products' => $productosAgotados
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Los siguientes productos ya no están disponibles: ' . $nombresAgotados . 
                                '. Por favor actualice su carrito.',
                    'unavailable_products' => $productosAgotados
                ], 400);
            }

            // Validar que el total coincida con productos válidos únicamente
            $totalCalculadoValidos = 0;
            foreach ($productosValidos as $productoPedido) {
                $producto = \App\Models\Producto::find($productoPedido['id']);
                $totalCalculadoValidos += $producto->precio * $productoPedido['cantidad'];
            }
            
            $totalPago = $request->payment_data['amount'];

            if (abs($totalCalculadoValidos - $totalPago) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'El monto del pago no coincide con el total de productos disponibles'
                ], 400);
            }

            // Procesar pago con el microservicio
            $paymentResponse = Http::timeout(30)->post($this->microserviceUrl . '/validate', $request->payment_data);

            if (!$paymentResponse->successful()) {
                $error = $paymentResponse->json('error', 'Error al procesar el pago');
                
                Log::warning('Payment failed', [
                    'user_id' => Auth::id(),
                    'amount' => $request->payment_data['amount'],
                    'error' => $error,
                    'status_code' => $paymentResponse->status()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => $error
                ], 400);
            }

            $paymentResult = $paymentResponse->json();

            if (!$paymentResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $paymentResult['error'] ?? 'Pago rechazado'
                ], 400);
            }

            // Crear el pedido si el pago fue exitoso
            $pedido = new Pedido;
            $pedido->user_id = Auth::user()->id;
            $pedido->total = $totalCalculadoValidos; // Usar el total calculado de productos válidos
            $pedido->estado = 0; // Pendiente para preparación (aparece en panel admin)
            $pedido->transaction_id = $paymentResult['transaction_id'];
            $pedido->payment_method = 'card';
            $pedido->card_last4 = $paymentResult['card_last4'];
            $pedido->save();

            // Obtener el ID del pedido
            $pedidoId = $pedido->id;

            // Preparar productos para insercion masiva - solo productos válidos
            $pedidoProductos = [];
            foreach ($productosValidos as $producto) {
                $pedidoProductos[] = [
                    'pedido_id' => $pedidoId,
                    'producto_id' => $producto['id'],
                    'cantidad' => $producto['cantidad'],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ];
            }

            // Insertar productos del pedido
            PedidoProducto::insert($pedidoProductos);

            Log::info('Payment processed and order created for preparation', [
                'user_id' => Auth::id(),
                'pedido_id' => $pedidoId,
                'transaction_id' => $paymentResult['transaction_id'],
                'amount' => $totalCalculadoValidos,
                'card_last4' => $paymentResult['card_last4'],
                'estado' => 0, // Pendiente para preparación
                'productos_validos_count' => count($productosValidos)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pago procesado exitosamente. Tu pedido está siendo preparado.',
                'pedido_id' => $pedidoId,
                'transaction_id' => $paymentResult['transaction_id'],
                'card_last4' => $paymentResult['card_last4'],
                'amount' => $totalCalculadoValidos
            ]);

        } catch (\Exception $e) {
            Log::error('Payment processing error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al procesar el pago'
            ], 500);
        }
    }

    /**
     * Verificar estado del microservicio de pagos
     */
    public function checkMicroserviceHealth()
    {
        try {
            $response = Http::timeout(5)->get($this->microserviceUrl . '/health');
            
            if ($response->successful()) {
                return response()->json([
                    'status' => 'healthy',
                    'microservice' => $response->json()
                ]);
            } else {
                return response()->json([
                    'status' => 'unhealthy',
                    'message' => 'Microservicio no responde correctamente'
                ], 503);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'message' => 'No se puede conectar con el microservicio',
                'error' => $e->getMessage()
            ], 503);
        }
    }

    /**
     * Obtener pedidos pagados del usuario actual
     */
    public function getPaidOrders()
    {
        try {
            $pedidos = Pedido::with('user')
                ->with('productos')
                ->where('user_id', Auth::id())
                ->whereNotNull('transaction_id') // Pedidos pagados tienen transaction_id
                ->orderBy('created_at', 'desc')
                ->get();

            return new PedidoCollection($pedidos);

        } catch (\Exception $e) {
            Log::error('Error fetching paid orders', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al obtener pedidos pagados'
            ], 500);
        }
    }
}