@echo off
echo Inicializando base de datos de desarrollo...

cd c:\Users\cr1st\Desktop\pedro\gestion-despachos\backend
node ../init-db.js

echo.
echo Proceso completado. Presione cualquier tecla para continuar.
pause >nul