-- Actualizar tarjetas con los hashes correctos
USE payment_microservice;

-- Limpiar tabla y reinsertar con hashes correctos
DELETE FROM cards;

-- Insertar tarjetas de prueba con hashes correctos
INSERT INTO cards (hash_pan, holder_name, last4, exp_mm, exp_yy, balance_cents, status) VALUES
-- Tarjeta Visa de prueba: 4111111111111111
('9bbef19476623ca56c17da75fd57734dbf82530686043a6e491c6d71befe8f6e', 'JUAN PEREZ', '1111', 12, 28, 1500000, 'active'),
-- Tarjeta Mastercard de prueba: 5555555555554444  
('2f725bbd1f405a1ed0336abaf85ddfeb6902a9984a76fd877c3b5cc3b5085a82', 'MARIA GARCIA', '4444', 10, 27, 2000000, 'active'),
-- Tarjeta con fondos insuficientes: 4000000000000002
('acd08f29a41f2e55ab0c4f774b1562b03ff01a905ed5b100f4facd43af572b1b', 'CARLOS RODRIGUEZ', '0002', 6, 26, 50000, 'active'),
-- Tarjeta bloqueada: 4000000000000069
('9830b424b7a69ba9909021c80d56005f9f03cfc1d0cfcbec20fbb906bd8d19c4', 'ANA MARTINEZ', '0069', 3, 25, 1000000, 'blocked');

-- Verificar datos insertados
SELECT 
    id,
    holder_name,
    last4,
    CONCAT(exp_mm, '/', exp_yy) as expiry,
    balance_cents / 100 as balance_pesos,
    status,
    LEFT(hash_pan, 8) as hash_preview
FROM cards;