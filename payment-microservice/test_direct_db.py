#!/usr/bin/env python3
"""
Script para probar la conexión a la base de datos y simular una transacción manual
"""

import mysql.connector
from mysql.connector import Error
import hashlib
from datetime import datetime
import secrets
import string

# Configuracion de base de datos
DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'payment_microservice',
    'user': 'root',
    'password': 'admon',
    'port': 3307
}

def hash_pan(pan):
    """Crear hash seguro del PAN"""
    return hashlib.sha256(pan.encode()).hexdigest()

def test_direct_payment():
    """Simular un pago directamente en la base de datos"""
    
    print("🔬 PRUEBA DIRECTA DE DESCUENTO EN BASE DE DATOS")
    print("=" * 55)
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # PAN de la tarjeta de prueba
        pan = "4111111111111111"
        pan_hash = hash_pan(pan)
        amount_cents = 2550  # ₡25.50
        
        print(f"💳 Tarjeta: ****-****-****-1111")
        print(f"💰 Monto a descontar: ₡{amount_cents/100:.2f}")
        
        # Buscar tarjeta
        cursor.execute("""
            SELECT id, holder_name, balance_cents, status 
            FROM cards 
            WHERE hash_pan = %s
        """, (pan_hash,))
        
        card = cursor.fetchone()
        
        if not card:
            print("❌ Tarjeta no encontrada")
            return
        
        print(f"✅ Tarjeta encontrada:")
        print(f"   ID: {card['id']}")
        print(f"   Titular: {card['holder_name']}")
        print(f"   Balance actual: ₡{card['balance_cents']/100:.2f}")
        print(f"   Estado: {card['status']}")
        
        if card['balance_cents'] < amount_cents:
            print("❌ Fondos insuficientes")
            return
        
        # Calcular nuevo balance
        new_balance = card['balance_cents'] - amount_cents
        print(f"🧮 Nuevo balance calculado: ₡{new_balance/100:.2f}")
        
        # Generar ID de transacción
        transaction_id = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))
        
        print(f"\n🔄 Procesando transacción...")
        print(f"   ID: {transaction_id}")
        
        # Actualizar balance
        cursor.execute("""
            UPDATE cards 
            SET balance_cents = %s, updated_at = %s
            WHERE id = %s
        """, (new_balance, datetime.now(), card['id']))
        
        print(f"   ✅ Balance actualizado en memoria")
        
        # Registrar transacción
        cursor.execute("""
            INSERT INTO transactions (transaction_id, card_id, amount_cents, status, created_at)
            VALUES (%s, %s, %s, 'approved', %s)
        """, (transaction_id, card['id'], amount_cents, datetime.now()))
        
        print(f"   ✅ Transacción registrada en memoria")
        
        # Confirmar cambios
        connection.commit()
        print(f"   ✅ Cambios confirmados en base de datos")
        
        # Verificar el balance actualizado
        cursor.execute("""
            SELECT balance_cents 
            FROM cards 
            WHERE id = %s
        """, (card['id'],))
        
        updated_card = cursor.fetchone()
        print(f"\n🔍 Verificación:")
        print(f"   Balance después del commit: ₡{updated_card['balance_cents']/100:.2f}")
        
        if updated_card['balance_cents'] == new_balance:
            print(f"✅ ¡ÉXITO! El descuento se aplicó correctamente")
        else:
            print(f"❌ ERROR: El balance no se actualizó")
            print(f"   Esperado: ₡{new_balance/100:.2f}")
            print(f"   Actual: ₡{updated_card['balance_cents']/100:.2f}")
        
    except Error as e:
        print(f"❌ Error de base de datos: {e}")
        if 'connection' in locals():
            connection.rollback()
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print(f"\n🔌 Conexión cerrada")

if __name__ == "__main__":
    test_direct_payment()