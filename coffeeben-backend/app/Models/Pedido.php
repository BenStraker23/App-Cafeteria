<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    // Constantes para los estados del pedido
    const ESTADO_PENDIENTE = 0;
    const ESTADO_COMPLETADO = 1;
    const ESTADO_CANCELADO = 2;

    protected $fillable = [
        'user_id',
        'total',
        'estado',
        'transaction_id',
        'payment_method',
        'card_last4'
    ];

    protected $casts = [
        'total' => 'double',
        'estado' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'pedido_productos')
                    ->withPivot('cantidad')
                    ->withTimestamps();
    }
}