<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;
use Carbon\Carbon;


class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categorias = [
            [
                'nombre' => 'Café',
                'icono' => 'coffee',
            ],
            [
                'nombre' => 'Hamburguesas',
                'icono' => 'croissant',
            ],
            [
                'nombre' => 'Pizzas',
                'icono' => 'hot_cakes',
            ],
            [
                'nombre' => 'Donas',
                'icono' => 'macarron',
            ],
            [
                'nombre' => 'Pasteles',
                'icono' => 'cappuccino',
            ],
            [
                'nombre' => 'Galletas',
                'icono' => 'ice_coffee',
            ],
            [
                'nombre' => 'Bebidas',
                'icono' => 'bebidas',
            ]
        ];

        foreach ($categorias as $categoria) {
            Categoria::updateOrCreate(
                ['nombre' => $categoria['nombre']], // Condición para buscar
                $categoria // Datos a insertar o actualizar
            );
        }
    }
}