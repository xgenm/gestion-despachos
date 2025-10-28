@echo off
REM Script para configurar PostgreSQL en Windows
REM Requiere tener PostgreSQL instalado en C:\Program Files\PostgreSQL\18

echo ============================================
echo Configurando PostgreSQL para Gestion Despachos
echo ============================================
echo.

REM Ruta a psql
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"

REM Verificar si psql existe
if not exist %PSQL_PATH% (
    echo ERROR: No se encontro psql en %PSQL_PATH%
    echo Por favor verifica la ruta de instalacion de PostgreSQL
    pause
    exit /b 1
)

echo [1/3] Restableciendo contraseña del usuario postgres...
%PSQL_PATH% -U postgres -d postgres -c "ALTER USER postgres PASSWORD 'postgres';"

echo [2/3] Creando base de datos gestion_despachos...
%PSQL_PATH% -U postgres -d postgres -c "DROP DATABASE IF EXISTS gestion_despachos; CREATE DATABASE gestion_despachos;"

echo [3/3] Verificando conexion...
%PSQL_PATH% -U postgres -d gestion_despachos -c "SELECT 1;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo ✓ PostgreSQL configurado correctamente
    echo ============================================
    echo.
    echo Credenciales:
    echo   Usuario: postgres
    echo   Contraseña: postgres
    echo   Base de datos: gestion_despachos
    echo   Host: localhost
    echo   Puerto: 5432
    echo.
) else (
    echo.
    echo ERROR: Fallo al configurar PostgreSQL
    echo Por favor verifica que PostgreSQL este ejecutandose
    echo.
)

pause
