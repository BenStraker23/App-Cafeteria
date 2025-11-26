from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import mysql.connector
from mysql.connector import Error
import logging

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
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
            logger.info("Conexión a BD exitosa")
            return connection
    except Error as e:
        logger.error(f"Error al conectar con MySQL: {e}")
        return None

def hash_pan(pan):
    """Crear hash seguro del PAN"""
    return hashlib.sha256(pan.encode()).hexdigest()

@app.route('/api/payment/health', methods=['GET'])
def health_check():
    """Endpoint de verificacion de salud del servicio"""
    logger.info("Health check solicitado")
    try:
        connection = get_db_connection()
        if connection:
            connection.close()
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'message': 'Microservicio funcionando correctamente'
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected'
            }), 500
    except Exception as e:
        logger.error(f"Error en health check: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/payment/validate', methods=['POST'])
def validate_payment():
    """Endpoint principal para validar pagos"""
    logger.info("Validación de pago solicitada")
    try:
        data = request.get_json()
        logger.info(f"Datos recibidos: {data}")
        
        if not data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        # Validar datos requeridos
        required_fields = ['pan', 'exp_mm', 'exp_yy', 'cvv', 'holder_name', 'amount']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        pan = data['pan'].replace(' ', '')
        holder_name = data['holder_name']
        amount_cents = int(float(data['amount']) * 100)
        
        logger.info(f"Procesando pago para: {holder_name}, Monto: {amount_cents} centavos")
        
        # Crear hash del PAN
        pan_hash = hash_pan(pan)
        last4 = pan[-4:]
        
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
            logger.info(f"Tarjeta encontrada: {card is not None}")
            
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
            
            if card['status'] != 'active':
                return jsonify({
                    'success': False,
                    'error': 'Tarjeta bloqueada'
                }), 400
            
            # Verificar fondos suficientes
            if card['balance_cents'] < amount_cents:
                return jsonify({
                    'success': False,
                    'error': 'Fondos insuficientes'
                }), 400
            
            # Simular procesamiento exitoso
            transaction_id = f"TXN{card['id']}{amount_cents}"
            
            logger.info(f"Pago aprobado: {transaction_id}")
            
            return jsonify({
                'success': True,
                'transaction_id': transaction_id,
                'message': 'Pago procesado exitosamente',
                'card_last4': last4,
                'amount': data['amount']
            })
            
        except Error as e:
            logger.error(f"Error en transaccion: {e}")
            return jsonify({
                'success': False,
                'error': 'Error al procesar el pago'
            }), 500
        
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

if __name__ == '__main__':
    print("🚀 Iniciando microservicio de pagos...")
    print("📍 URL: http://127.0.0.1:5001")
    print("🔍 Health check: http://127.0.0.1:5001/api/payment/health")
    app.run(debug=True, host='127.0.0.1', port=5001)