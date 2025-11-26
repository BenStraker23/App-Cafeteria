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

def test_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("✅ Conexión exitosa a la base de datos")
            
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT COUNT(*) as card_count FROM cards")
            result = cursor.fetchone()
            print(f"✅ Tarjetas en la base de datos: {result['card_count']}")
            
            cursor.execute("SELECT holder_name, last4, status FROM cards")
            cards = cursor.fetchall()
            print("✅ Tarjetas disponibles:")
            for card in cards:
                print(f"   - {card['holder_name']}: **** {card['last4']} ({card['status']})")
            
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f"❌ Error de conexión: {e}")
        return False

if __name__ == "__main__":
    test_connection()