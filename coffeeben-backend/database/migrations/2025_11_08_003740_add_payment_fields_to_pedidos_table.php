<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('transaction_id', 20)->nullable()->after('estado')->comment('ID de transaccion del microservicio de pagos');
            $table->string('payment_method', 20)->nullable()->after('transaction_id')->default('card')->comment('Metodo de pago utilizado');
            $table->string('card_last4', 4)->nullable()->after('payment_method')->comment('Ultimos 4 digitos de la tarjeta');
            
            $table->index(['transaction_id']);
            $table->index(['payment_method']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropIndex(['payment_method']);
            $table->dropColumn(['transaction_id', 'payment_method', 'card_last4']);
        });
    }
};
