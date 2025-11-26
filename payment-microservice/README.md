# Payment Microservice

Microservicio de validación de pagos con tarjeta de crédito para CoffeeBen.

## Características

- Validación de tarjetas con algoritmo Luhn
- Seguridad PAN con hash SHA-256
- Verificación de fondos
- Base de datos MySQL independiente
- API REST con Flask
- Puerto: 5001 (http://127.0.0.1:5001)

## Instalación

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Configurar base de datos MySQL:
```bash
mysql -h 127.0.0.1 -P 3307 -u root -padmon < database.sql
```

3. Ejecutar el microservicio:
```bash
python app.py
```

## API Endpoints

### POST /api/payment/validate
Valida un pago con tarjeta.

**Request:**
```json
{
    "pan": "4111111111111111",
    "exp_mm": "12",
    "exp_yy": "28", 
    "cvv": "123",
    "holder_name": "JUAN PEREZ",
    "amount": "150.00"
}
```

**Response (Éxito):**
```json
{
    "success": true,
    "transaction_id": "TXN123456789",
    "message": "Pago procesado exitosamente",
    "card_last4": "1111",
    "amount": "150.00",
    "new_balance": 1350.00
}
```

**Response (Error):**
```json
{
    "success": false,
    "error": "Fondos insuficientes"
}
```

### GET /api/payment/health
Verifica el estado del servicio.

### POST /api/payment/cards
Agrega tarjetas de prueba.

## Tarjetas de Prueba

| Número | Titular | Exp | Balance | Estado |
|--------|---------|-----|---------|--------|
| 4111111111111111 | JUAN PEREZ | 12/28 | $15,000 | Activa |
| 5555555555554444 | MARIA GARCIA | 10/27 | $20,000 | Activa |
| 4000000000000002 | CARLOS RODRIGUEZ | 06/26 | $500 | Fondos bajos |
| 4000000000000069 | ANA MARTINEZ | 03/25 | $10,000 | Bloqueada |

## Seguridad

- El PAN real nunca se almacena
- Se usa hash SHA-256 irreversible
- Solo se guardan los últimos 4 dígitos
- Validación completa de datos
- Logs sin información sensible

## PM2 (Opcional)

Para ejecutar con PM2:
```bash
pm2 start ecosystem.config.json
```