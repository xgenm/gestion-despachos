@echo off
REM Script para iniciar la aplicacion Gestion de Despachos en Windows
REM Esto inicia el backend y frontend en dos terminales separadas

cd /d "%~dp0"

echo ============================================
echo Iniciando Gestion de Despachos
echo ============================================
echo.
echo [1/2] Iniciando Backend en puerto 3002...
echo Abre una nueva terminal para el backend...
start cmd /k "cd backend && npm run dev"

echo.
echo Esperando 3 segundos antes de iniciar el frontend...
timeout /t 3 /nobreak

echo [2/2] Iniciando Frontend en puerto 3001...
echo Abre una nueva terminal para el frontend...
start cmd /k "npm start"

echo.
echo ============================================
echo Aplicacion iniciada
echo ============================================
echo.
echo URLs:
echo   Frontend: http://localhost:3001
echo   Backend: http://localhost:3002
echo.
echo Credenciales de prueba:
echo   Usuario: admin
echo   Contraseña: admin123
echo.
echo Nota: Asegúrate de que PostgreSQL este ejecutandose
echo.

pause
