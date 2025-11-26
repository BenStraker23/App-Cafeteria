<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Producto;
use App\Models\Categoria;

// Verificar categoría de bebidas
$categoria = Categoria::where('nombre', 'Bebidas')->first();
if ($categoria) {
    echo "✅ Categoría Bebidas encontrada con ID: " . $categoria->id . "\n";
} else {
    echo "❌ Categoría Bebidas NO encontrada\n";
    exit(1);
}

// Verificar productos de bebidas
$bebidas = Producto::where('categoria_id', $categoria->id)->get();

echo "\n📊 Productos de bebidas encontrados: " . $bebidas->count() . "\n\n";

foreach ($bebidas as $bebida) {
    echo "🥤 " . $bebida->nombre . "\n";
    echo "   💰 Precio: $" . $bebida->precio . "\n";
    echo "   📏 Cantidad: " . ($bebida->cantidad ?: 'No especificada') . "\n";
    echo "   🖼️  Imagen: " . $bebida->imagen . "\n";
    echo "   ✅ Disponible: " . ($bebida->disponible ? 'Sí' : 'No') . "\n";
    echo "   ---\n";
}