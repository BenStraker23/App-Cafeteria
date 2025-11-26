from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime
import secrets
import string
import logging
from werkzeug.exceptions import BadRequest

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuracion de base de datos
DB_CONFIG = {
    'host': '127.0.0.1',
    'database': 'payment_microservice',
    'user': 'root',
    'password': 'admon',
    'port': 3307
}

def get_db_connection():
    """Obtener conexion a la base de datos"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        logger.error(f"Error al conectar con MySQL: {e}")
        return None

def validate_luhn(card_number):
    """Validar numero de tarjeta con algoritmo Luhn"""
    # Remover espacios y convertir a string
    card_number = str(card_number).replace(' ', '')
    
    if not card_number.isdigit():
        return False
    
    # Algoritmo Luhn
    def luhn_checksum(card_num):
        def digits_of(n):
            return [int(d) for d in str(n)]
        digits = digits_of(card_num)
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        checksum = sum(odd_digits)
        for d in even_digits:
            checksum += sum(digits_of(d*2))
        return checksum % 10
    
    return luhn_checksum(card_number) == 0

def hash_pan(pan):
    """Crear hash seguro del PAN"""
    # Usar SHA-256 para crear hash irreversible
    return hashlib.sha256(pan.encode()).hexdigest()

def get_last4(pan):
    """Obtener ultimos 4 digitos del PAN"""
    return pan[-4:]

def validate_expiry_date(exp_mm, exp_yy):
    """Validar fecha de expiracion"""
    try:
        month = int(exp_mm)
        year = int('20' + exp_yy) if len(exp_yy) == 2 else int(exp_yy)
        
        if month < 1 or month > 12:
            return False
        
        current_date = datetime.now()
        exp_date = datetime(year, month, 1)
        
        return exp_date > current_date
    except:
        return False

@app.route('/api/payment/validate', methods=['POST'])
def validate_payment():
    """Endpoint principal para validar pagos"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        # Validar datos requeridos
        required_fields = ['pan', 'exp_mm', 'exp_yy', 'cvv', 'holder_name', 'amount']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        pan = data['pan'].replace(' ', '')
        exp_mm = data['exp_mm']
        exp_yy = data['exp_yy'] 
        cvv = data['cvv']
        holder_name = data['holder_name']
        amount_cents = float(data['amount']) * 100  # Convertir a centavos como decimal
        
        # Validaciones
        if not validate_luhn(pan):
            return jsonify({
                'success': False,
                'error': 'Numero de tarjeta invalido'
            }), 400
        
        if len(pan) < 13 or len(pan) > 19:
            return jsonify({
                'success': False,
                'error': 'Longitud de tarjeta invalida'
            }), 400
        
        if not validate_expiry_date(exp_mm, exp_yy):
            return jsonify({
                'success': False,
                'error': 'Fecha de expiracion invalida'
            }), 400
        
        if len(cvv) != 3:
            return jsonify({
                'success': False,
                'error': 'CVV invalido'
            }), 400
        
        # Crear hash del PAN
        pan_hash = hash_pan(pan)
        last4 = get_last4(pan)
        
        # Buscar tarjeta en base de datos
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'error': 'Error de conexion a base de datos'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
        try:
            # Buscar tarjeta por hash_pan
            cursor.execute("""
                SELECT id, holder_name, last4, exp_mm, exp_yy, balance_cents, status 
                FROM cards 
                WHERE hash_pan = %s
            """, (pan_hash,))
            
            card = cursor.fetchone()
            
            if not card:
                return jsonify({
                    'success': False,
                    'error': 'Tarjeta no encontrada'
                }), 404
            
            # Validar que los datos coincidan
            if card['holder_name'].upper() != holder_name.upper():
                return jsonify({
                    'success': False,
                    'error': 'Nombre del titular no coincide'
                }), 400
            
            if card['exp_mm'] != int(exp_mm) or card['exp_yy'] != int(exp_yy):
                return jsonify({
                    'success': False,
                    'error': 'Fecha de expiracion no coincide'
                }), 400
            
            if card['status'] != 'active':
                return jsonify({
                    'success': False,
                    'error': 'Tarjeta bloqueada'
                }), 400
            
            # Verificar fondos suficientes
            balance_cents = float(card['balance_cents'])  # Convertir Decimal a float
            if balance_cents < amount_cents:
                return jsonify({
                    'success': False,
                    'error': 'Fondos insuficientes'
                }), 400
            
            # Generar ID de transaccion
            transaction_id = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))
            
            # Actualizar balance de la tarjeta
            new_balance = balance_cents - amount_cents
            cursor.execute("""
                UPDATE cards 
                SET balance_cents = %s 
                WHERE id = %s
            """, (new_balance, card['id']))
            
            # Registrar transaccion
            cursor.execute("""
                INSERT INTO transactions (transaction_id, card_id, amount_cents, status, created_at)
                VALUES (%s, %s, %s, 'approved', %s)
            """, (transaction_id, card['id'], amount_cents, datetime.now()))
            
            connection.commit()
            
            # Log de la transaccion exitosa (sin datos sensibles)
            logger.info(f"Transaccion aprobada: {transaction_id}, Monto: {amount_cents} centavos, Last4: {last4}")
            
            return jsonify({
                'success': True,
                'transaction_id': transaction_id,
                'message': 'Pago procesado exitosamente',
                'card_last4': last4,
                'amount': data['amount'],
                'new_balance': new_balance / 100  # Convertir de centavos a pesos
            })
            
        except Error as e:
            connection.rollback()
            logger.error(f"Error en transaccion: {e}")
            return jsonify({
                'success': False,
                'error': 'Error al procesar el pago'
            }), 500
        
        finally:
            cursor.close()
            connection.close()
            
    except BadRequest:
        return jsonify({'error': 'Datos JSON malformados'}), 400
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

@app.route('/api/payment/health', methods=['GET'])
def health_check():
    """Endpoint de verificacion de salud del servicio"""
    try:
        connection = get_db_connection()
        if connection:
            connection.close()
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected',
                'timestamp': datetime.now().isoformat()
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/payment/cards', methods=['POST'])
def add_test_card():
    """Endpoint para agregar tarjetas de prueba"""
    try:
        data = request.get_json()
        
        required_fields = ['pan', 'exp_mm', 'exp_yy', 'holder_name', 'balance']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        pan = data['pan'].replace(' ', '')
        
        if not validate_luhn(pan):
            return jsonify({'error': 'Numero de tarjeta invalido'}), 400
        
        pan_hash = hash_pan(pan)
        last4 = get_last4(pan)
        balance_cents = int(float(data['balance']) * 100)
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error de conexion a base de datos'}), 500
        
        cursor = connection.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO cards (hash_pan, holder_name, last4, exp_mm, exp_yy, balance_cents, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'active')
            """, (pan_hash, data['holder_name'], last4, int(data['exp_mm']), 
                  int(data['exp_yy']), balance_cents))
            
            connection.commit()
            
            return jsonify({
                'success': True,
                'message': 'Tarjeta agregada exitosamente',
                'card_hash': pan_hash[:8] + '...',  # Solo mostrar primeros 8 caracteres
                'last4': last4
            })
            
        except Error as e:
            connection.rollback()
            logger.error(f"Error al agregar tarjeta: {e}")
            return jsonify({'error': 'Error al agregar tarjeta'}), 500
        
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)