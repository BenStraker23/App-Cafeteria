<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datos = [
            // Cafés (categoria_id = 1)
            array( 
                'nombre' =>  "Café Caramel con Chocolate",
                'precio' => 59.9,
                'imagen' => "cafe_01",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café Frio con Chocolate Grande",
                'precio' => 49.9,
                'imagen' => "cafe_02",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Latte Frio con Chocolate Grande",
                'precio' => 54.9,
                'imagen' => "cafe_03",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café Deluxe con Leche",
                'precio' => 39.9,
                'imagen' => "cafe_04",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café Americano",
                'precio' => 25.9,
                'imagen' => "cafe_05",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café con Crema",
                'precio' => 35.9,
                'imagen' => "cafe_06",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café Espresso",
                'precio' => 29.9,
                'imagen' => "cafe_12",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café Cappuccino",
                'precio' => 45.9,
                'imagen' => "cafe_07",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café Mocha",
                'precio' => 42.9,
                'imagen' => "cafe_08",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Café Macchiato",
                'precio' => 38.9,
                'imagen' => "cafe_09",
                'categoria_id' => 1,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),

            // Hamburguesas (categoria_id = 2)
            array( 
                'nombre' =>  "Hamburguesa Sencilla",
                'precio' => 59.9,
                'imagen' => "hamburguesas_01",
                'categoria_id' => 2,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Hamburguesa Doble Carne",
                'precio' => 79.9,
                'imagen' => "hamburguesas_02",
                'categoria_id' => 2,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Hamburguesa BBQ",
                'precio' => 89.9,
                'imagen' => "hamburguesas_03",
                'categoria_id' => 2,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Hamburguesa Clásica",
                'precio' => 65.9,
                'imagen' => "hamburguesas_04",
                'categoria_id' => 2,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Hamburguesa con Queso",
                'precio' => 69.9,
                'imagen' => "hamburguesas_05",
                'categoria_id' => 2,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),

            // Pizzas (categoria_id = 3)
            array( 
                'nombre' =>  "Pizza Spicy con Doble Queso",
                'precio' => 69.9,
                'imagen' => "pizzas_01",
                'categoria_id' => 3,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Pizza Margherita",
                'precio' => 55.9,
                'imagen' => "pizzas_02",
                'categoria_id' => 3,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Pizza Pepperoni",
                'precio' => 65.9,
                'imagen' => "pizzas_03",
                'categoria_id' => 3,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Pizza Hawaiana",
                'precio' => 62.9,
                'imagen' => "pizzas_04",
                'categoria_id' => 3,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Pizza Cuatro Quesos",
                'precio' => 75.9,
                'imagen' => "pizzas_05",
                'categoria_id' => 3,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),

            // Donas (categoria_id = 4)
            array( 
                'nombre' =>  "Paquete de 3 donas de Chocolate",
                'precio' => 39.9,
                'imagen' => "donas_01",
                'categoria_id' => 4,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Donas Glaseadas",
                'precio' => 29.9,
                'imagen' => "donas_02",
                'categoria_id' => 4,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Donas con Sprinkles",
                'precio' => 32.9,
                'imagen' => "donas_03",
                'categoria_id' => 4,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Donas Rellenas de Crema",
                'precio' => 45.9,
                'imagen' => "donas_04",
                'categoria_id' => 4,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Donas de Fresa",
                'precio' => 35.9,
                'imagen' => "donas_05",
                'categoria_id' => 4,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),

            // Pasteles (categoria_id = 5)
            array( 
                'nombre' =>  "4 Rebanadas de Pay de Queso",
                'precio' => 69.9,
                'imagen' => "pastel_01",
                'categoria_id' => 5,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Pastel de Chocolate",
                'precio' => 75.9,
                'imagen' => "pastel_02",
                'categoria_id' => 5,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Pastel de Vainilla",
                'precio' => 65.9,
                'imagen' => "pastel_03",
                'categoria_id' => 5,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Pastel Red Velvet",
                'precio' => 85.9,
                'imagen' => "pastel_04",
                'categoria_id' => 5,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),

            // Galletas (categoria_id = 6)
            array( 
                'nombre' =>  "Paquete Galletas de Chocolate",
                'precio' => 29.9,
                'imagen' => "galletas_01",
                'categoria_id' => 6,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Galletas de Avena",
                'precio' => 25.9,
                'imagen' => "galletas_02",
                'categoria_id' => 6,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Galletas con Chispas",
                'precio' => 32.9,
                'imagen' => "galletas_03",
                'categoria_id' => 6,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
            array( 
                'nombre' =>  "Galletas de Mantequilla",
                'precio' => 28.9,
                'imagen' => "galletas_04",
                'categoria_id' => 6,
                'disponible' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ),
        ];

        DB::table('productos')->insert($datos);
    }
}
