@echo off
echo Configurando entorno de desarrollo...

echo.
echo Instalando dependencias del backend...
cd c:\Users\cr1st\Desktop\pedro\gestion-despachos\backend
npm install

echo.
echo Instalando dependencias del frontend...
cd c:\Users\cr1st\Desktop\pedro\gestion-despachos
npm install

echo.
echo Creando archivos de configuracion...
cd c:\Users\cr1st\Desktop\pedro\gestion-despachos

REM Crear .env para el frontend si no existe
if not exist .env (
  echo REACT_APP_API_URL=http://localhost:3002/api > .env
  echo Archivo .env creado para el frontend
)

REM Crear .env para el backend si no existe
if not exist backend\.env (
  echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestion_despachos > backend\.env
  echo JWT_SECRET=secreto_de_desarrollo_jwt_12345 >> backend\.env
  echo PORT=3002 >> backend\.env
  echo Archivo .env creado para el backend
)

echo.
echo Entorno de desarrollo configurado exitosamente.
echo.
echo Para iniciar el entorno de desarrollo, ejecute start-dev.bat
echo.
pause