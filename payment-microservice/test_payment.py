#!/usr/bin/env python3
"""
Script para probar el procesamiento de pagos y verificar que el balance se descuente correctamente
"""

import requests
import json
import time

def test_payment():
    """Probar pago y verificar descuento del balance"""
    
    # URL del microservicio
    base_url = "http://127.0.0.1:5001"
    
    print("🧪 PRUEBA DE PAGO - VERIFICACIÓN DE DESCUENTO DE BALANCE")
    print("=" * 65)
    
    # Verificar que el microservicio esté funcionando
    try:
        response = requests.get(f"{base_url}/api/payment/health", timeout=5)
        if response.status_code == 200:
            print("✅ Microservicio funcionando correctamente")
        else:
            print("❌ Microservicio no disponible")
            return
    except requests.exceptions.RequestException:
        print("❌ No se puede conectar al microservicio")
        print("   Verifica que esté ejecutándose en http://127.0.0.1:5001")
        return
    
    # Datos de prueba - Tarjeta de Juan Pérez (balance inicial: ₡15,000.00)
    payment_data = {
        "pan": "4111111111111111",        # Visa de prueba
        "exp_mm": "12",
        "exp_yy": "28", 
        "cvv": "123",
        "holder_name": "JUAN PEREZ",
        "amount": "25.50"                 # Monto a descontar: ₡25.50
    }
    
    print(f"\n💳 Datos de la prueba:")
    print(f"   Tarjeta: ****-****-****-1111")
    print(f"   Titular: {payment_data['holder_name']}")
    print(f"   Monto: ₡{payment_data['amount']}")
    print(f"   Balance inicial esperado: ₡15,000.00")
    
    # Realizar el pago
    print(f"\n🔄 Procesando pago...")
    try:
        response = requests.post(
            f"{base_url}/api/payment/validate",
            json=payment_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"   Estado HTTP: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Pago procesado exitosamente!")
            print(f"   ID Transacción: {result.get('transaction_id', 'N/A')}")
            print(f"   Monto procesado: ₡{result.get('amount', 'N/A')}")
            print(f"   Nuevo balance: ₡{result.get('new_balance', 'N/A')}")
            print(f"   Balance esperado: ₡{15000.00 - float(payment_data['amount'])}")
            
            # Verificar que el descuento se aplicó correctamente
            expected_balance = 15000.00 - float(payment_data['amount'])
            actual_balance = result.get('new_balance', 0)
            
            if abs(actual_balance - expected_balance) < 0.01:  # Tolerancia para decimales
                print(f"✅ Balance descontado correctamente!")
            else:
                print(f"❌ Error: Balance incorrecto")
                print(f"   Esperado: ₡{expected_balance}")
                print(f"   Obtenido: ₡{actual_balance}")
                
        else:
            error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
            print(f"❌ Error en el pago:")
            print(f"   Mensaje: {error_data.get('error', 'Error desconocido')}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
    except json.JSONDecodeError:
        print(f"❌ Respuesta no válida del servidor")
    
    # Agregar delay antes de verificar balance
    print(f"\n⏳ Esperando 2 segundos para verificar balance...")
    time.sleep(2)

def test_insufficient_funds():
    """Probar pago con fondos insuficientes"""
    
    base_url = "http://127.0.0.1:5001"
    
    print(f"\n\n🧪 PRUEBA DE FONDOS INSUFICIENTES")
    print("=" * 45)
    
    # Tarjeta con balance bajo - Carlos Rodriguez (balance: ₡500.00)
    payment_data = {
        "pan": "4000000000000002",
        "exp_mm": "06",
        "exp_yy": "26",
        "cvv": "123",
        "holder_name": "CARLOS RODRIGUEZ",
        "amount": "600.00"  # Monto mayor al balance disponible
    }
    
    print(f"💳 Datos de la prueba:")
    print(f"   Tarjeta: ****-****-****-0002") 
    print(f"   Titular: {payment_data['holder_name']}")
    print(f"   Monto: ₡{payment_data['amount']}")
    print(f"   Balance disponible: ₡500.00")
    
    print(f"\n🔄 Intentando pago con fondos insuficientes...")
    
    try:
        response = requests.post(
            f"{base_url}/api/payment/validate",
            json=payment_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 400:
            error_data = response.json()
            if error_data.get('error') == 'Fondos insuficientes':
                print(f"✅ Validación correcta: Fondos insuficientes detectados")
            else:
                print(f"⚠️  Error diferente: {error_data.get('error', 'Desconocido')}")
        else:
            print(f"❌ El pago debería haber sido rechazado por fondos insuficientes")
            if response.status_code == 200:
                result = response.json()
                print(f"   Pago aprobado incorrectamente: {result}")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_payment()
    test_insufficient_funds()
    
    print(f"\n\n🏁 Pruebas completadas!")
    print(f"💡 Ejecuta 'python check_balance.py' para ver el estado actual de los balances")