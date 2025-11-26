<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@coffeeben.com'],
            [
                'name' => 'Admin CoffeeBen',
                'email' => 'admin@coffeeben.com',
                'password' => Hash::make('password123'),
                'admin' => true
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@coffeeben.com'],
            [
                'name' => 'Usuario CoffeeBen',
                'email' => 'user@coffeeben.com',
                'password' => Hash::make('password123'),
                'admin' => false
            ]
        );
    }
}