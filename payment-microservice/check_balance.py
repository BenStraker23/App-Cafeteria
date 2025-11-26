#!/usr/bin/env python3
"""
Script para verificar los balances de las tarjetas en la base de datos
"""

import mysql.connector
from mysql.connector import Error

# Configuracion de base de datos
DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'payment_microservice',
    'user': 'root',
    'password': 'admon',
    'port': 3307
}

def check_balances():
    """Verificar balances actuales de las tarjetas"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🏦 VERIFICACIÓN DE BALANCES - MICROSERVICIO DE PAGOS")
        print("=" * 60)
        
        # Obtener todas las tarjetas
        cursor.execute("""
            SELECT 
                id,
                holder_name,
                last4,
                CONCAT(exp_mm, '/', exp_yy) as expiry,
                balance_cents,
                balance_cents / 100 as balance_pesos,
                status,
                updated_at
            FROM cards 
            ORDER BY id
        """)
        
        cards = cursor.fetchall()
        
        if not cards:
            print("❌ No se encontraron tarjetas en la base de datos")
            return
        
        for card in cards:
            status_emoji = "✅" if card['status'] == 'active' else "❌"
            print(f"\n{status_emoji} Tarjeta ID: {card['id']}")
            print(f"   👤 Titular: {card['holder_name']}")
            print(f"   💳 Last4: ****-{card['last4']}")
            print(f"   📅 Vencimiento: {card['expiry']}")
            print(f"   💰 Balance: Q {card['balance_pesos']:.2f} ({card['balance_cents']} centavos)")
            print(f"   📊 Estado: {card['status']}")
            print(f"   🕒 Actualizado: {card['updated_at']}")
        
        # Verificar transacciones recientes
        cursor.execute("""
            SELECT 
                t.transaction_id,
                t.amount_cents,
                t.amount_cents / 100 as amount_pesos,
                t.status,
                t.created_at,
                c.holder_name,
                c.last4
            FROM transactions t
            JOIN cards c ON t.card_id = c.id
            ORDER BY t.created_at DESC
            LIMIT 10
        """)
        
        transactions = cursor.fetchall()
        
        print("\n\n💳 TRANSACCIONES RECIENTES")
        print("=" * 60)
        
        if not transactions:
            print("❌ No se encontraron transacciones")
        else:
            for txn in transactions:
                status_emoji = "✅" if txn['status'] == 'approved' else "❌"
                print(f"\n{status_emoji} ID: {txn['transaction_id']}")
                print(f"   👤 Titular: {txn['holder_name']}")
                print(f"   💳 Tarjeta: ****-{txn['last4']}")
                print(f"   💰 Monto: Q {txn['amount_pesos']:.2f}")
                print(f"   📊 Estado: {txn['status']}")
                print(f"   🕒 Fecha: {txn['created_at']}")
        
    except Error as e:
        print(f"❌ Error al conectar con la base de datos: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_balances()
