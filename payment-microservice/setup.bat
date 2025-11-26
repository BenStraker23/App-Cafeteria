@echo off
echo Configurando el sistema de pago con tarjeta para CoffeeBen...

echo.
echo 1. Configurando la base de datos del microservicio...
echo Ejecutando script SQL en MySQL...

mysql -h 127.0.0.1 -P 3307 -u root -padmon < database.sql

echo.
echo 2. Instalando dependencias de Python...

pip install -r requirements.txt

echo.
echo 3. Ejecutando migracion en Laravel...
cd ../coffeeben-backend
php artisan migrate

echo.
echo 4. Iniciando el microservicio de pagos...
cd ../payment-microservice
start python app.py

echo.
echo Sistema configurado exitosamente!
echo.
echo El microservicio estara disponible en: http://localhost:5000
echo.
echo Para probar el sistema:
echo 1. Inicie el servidor Laravel: php artisan serve
echo 2. Inicie el frontend React: npm run dev
echo 3. Use las tarjetas de prueba del README.md
echo.
pause