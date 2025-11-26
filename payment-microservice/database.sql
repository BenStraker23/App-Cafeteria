-- Crear base de datos
CREATE DATABASE IF NOT EXISTS payment_microservice;
USE payment_microservice;

-- Tabla de tarjetas
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hash_pan VARCHAR(64) UNIQUE NOT NULL COMMENT 'Hash SHA256 del PAN',
    holder_name VARCHAR(100) NOT NULL COMMENT 'Nombre del titular',
    last4 VARCHAR(4) NOT NULL COMMENT 'Ultimos 4 digitos',
    exp_mm INT NOT NULL COMMENT 'Mes de expiracion',
    exp_yy INT NOT NULL COMMENT 'Año de expiracion', 
    balance_cents INT NOT NULL DEFAULT 0 COMMENT 'Balance en centavos',
    status ENUM('active', 'blocked', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hash_pan (hash_pan),
    INDEX idx_status (status)
) COMMENT 'Tarjetas registradas con hash seguro del PAN';

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(20) UNIQUE NOT NULL COMMENT 'ID unico de transaccion',
    card_id INT NOT NULL,
    amount_cents INT NOT NULL COMMENT 'Monto en centavos',
    status ENUM('approved', 'declined', 'pending') DEFAULT 'pending',
    decline_reason VARCHAR(255) NULL COMMENT 'Razon de rechazo si aplica',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_card_id (card_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT 'Registro de transacciones';

-- Insertar tarjetas de prueba
INSERT IGNORE INTO cards (hash_pan, holder_name, last4, exp_mm, exp_yy, balance_cents, status) VALUES
-- Tarjeta Visa de prueba: 4111111111111111
('b4b147bc522828731f1a016bfa72c073e5463974db1d90663c92c0e70b39b211', 'JUAN PEREZ', '1111', 12, 28, 1500000, 'active'),
-- Tarjeta Mastercard de prueba: 5555555555554444  
('c8e7a8e93c4e8b7c5b7a3e2d1c8e7a9f2e4d6c1a3b5e8d7c2a9f6e3d5c7a1b4e', 'MARIA GARCIA', '4444', 10, 27, 2000000, 'active'),
-- Tarjeta con fondos insuficientes: 4000000000000002
('d9f8b7e6c5a4e3d2c1b9e8f7a6c5b4e3d2c1a9f8e7b6d5c4a3e2d1c9f8e7b6a5', 'CARLOS RODRIGUEZ', '0002', 6, 26, 50000, 'active'),
-- Tarjeta bloqueada: 4000000000000069
('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 'ANA MARTINEZ', '0069', 3, 25, 1000000, 'blocked');

-- Verificar datos insertados
SELECT 
    id,
    holder_name,
    last4,
    CONCAT(exp_mm, '/', exp_yy) as expiry,
    balance_cents / 100 as balance_pesos,
    status
FROM cards;