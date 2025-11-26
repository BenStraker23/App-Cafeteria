<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoProducto;
use App\Http\Resources\PedidoCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PedidoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return new PedidoCollection(Pedido::with('user')->with('productos')->where('estado', Pedido::ESTADO_PENDIENTE)->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Almacenar una orden
        $pedido = new Pedido;
        $pedido->user_id = Auth::user()->id;
        $pedido->total = $request->total;
        $pedido->save();

        // Obtener el ID del pedido
        $id = $pedido->id;

        // Obtener los productos
        $productos = $request->productos;

        // Formatear un arreglo 
        $pedido_producto = [];

        foreach($productos as $producto) {
            $pedido_producto[] = [
                'pedido_id' => $id,
                'producto_id' => $producto['id'],
                'cantidad' => $producto['cantidad'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon:: now()
            ];
        }

        // Almacenar en la BD
        PedidoProducto::insert($pedido_producto);
        
        return [
            'message' => 'Pedido realizado correctamente, estará listo en unos minutos'
        ];
    }

    /**
     * Display the specified resource.
     */
    public function show(Pedido $pedido)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pedido $pedido)
    {
        // Marcar pedido como completado
        $pedido->estado = Pedido::ESTADO_COMPLETADO;
        $pedido->save();

        return [
            'message' => 'Pedido marcado como completado',
            'pedido' => $pedido
        ];
    }

    /**
     * Cancel the specified pedido.
     */
    public function cancel(Pedido $pedido)
    {
        // Verificar que el pedido esté en estado pendiente
        if ($pedido->estado !== Pedido::ESTADO_PENDIENTE) {
            return response([
                'error' => 'Solo se pueden cancelar pedidos pendientes'
            ], 400);
        }

        // Marcar pedido como cancelado
        $pedido->estado = Pedido::ESTADO_CANCELADO;
        $pedido->save();

        return [
            'message' => 'Pedido cancelado correctamente',
            'pedido' => $pedido
        ];
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pedido $pedido)
    {
        //
    }
}
