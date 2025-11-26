# Setup script para Linux/Mac
#!/bin/bash

echo "Configurando el sistema de pago con tarjeta para CoffeeBen..."

echo ""
echo "1. Configurando la base de datos del microservicio..."
mysql -h 127.0.0.1 -P 3307 -u root -padmon < database.sql

echo ""
echo "2. Instalando dependencias de Python..."
pip install -r requirements.txt

echo ""
echo "3. Ejecutando migracion en Laravel..."
cd ../coffeeben-backend
php artisan migrate

echo ""
echo "4. El microservicio puede iniciarse con:"
echo "python app.py"

echo ""
echo "Sistema configurado exitosamente!"
echo ""
echo "Para probar el sistema:"
echo "1. Inicie el microservicio: python app.py"
echo "2. Inicie el servidor Laravel: php artisan serve"
echo "3. Inicie el frontend React: npm run dev"
echo "4. Use las tarjetas de prueba del README.md"