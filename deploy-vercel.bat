@echo off
REM Script de Despliegue Automático en Vercel para Windows
REM Uso: deploy-vercel.bat

cls
echo.
echo ================================================================================
echo                 ^|*| SCRIPT DE DESPLIEGUE EN VERCEL ^|*|
echo ================================================================================
echo.

REM Colores en Windows (simulados con colores de fondo)
setlocal enabledelayedexpansion

REM Verificar si Vercel CLI está instalado
echo [INFO] Verificando si Vercel CLI está instalado...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Vercel CLI no está instalado
    echo.
    echo Instala Vercel CLI con:
    echo   npm install -g vercel
    echo.
    pause
    exit /b 1
)
echo [OK] Vercel CLI detectado
echo.

REM Verificar estado de Git
echo [INFO] Verificando estado de Git...
git status >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No es un repositorio Git
) else (
    git status --porcelain >nul 2>&1
    if not errorlevel 1 (
        echo [OK] Git está actualizado
    ) else (
        echo [WARNING] Hay cambios sin commitear
        echo Por favor, haz commit antes de desplegar:
        echo   git add .
        echo   git commit -m "Tu mensaje"
        echo   git push origin main
        echo.
        pause
        exit /b 1
    )
)
echo.

REM Compilar backend
echo [INFO] Compilando backend...
cd backend
call npm run build
if errorlevel 1 (
    echo [ERROR] Error al compilar backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Backend compilado
echo.

REM Desplegar backend
echo ================================================================================
echo [INFO] Desplegando BACKEND en Vercel...
echo ================================================================================
echo.
echo Recuerda configurar estas variables de entorno en Vercel:
echo   DATABASE_URL=postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require
echo   JWT_SECRET=secreto_de_desarrollo_jwt_12345
echo   DISABLE_AUTH=false
echo   NODE_ENV=production
echo.
pause
cls

cd backend
vercel --prod
cd ..
echo.

REM Pedir URL del backend
set /p BACKEND_URL="[INFO] Ingresa la URL de tu backend en Vercel (ej: https://mi-backend.vercel.app): "

if "!BACKEND_URL!"=="" (
    echo [ERROR] URL del backend requerida
    pause
    exit /b 1
)

REM Crear .env.production
echo [INFO] Actualizando .env.production...
(
    echo REACT_APP_API_URL=!BACKEND_URL!/api
) > .env.production
echo [OK] .env.production actualizado
echo.

REM Desplegar frontend
echo ================================================================================
echo [INFO] Desplegando FRONTEND en Vercel...
echo ================================================================================
echo.
echo Recuerda configurar esta variable de entorno en Vercel:
echo   REACT_APP_API_URL=!BACKEND_URL!/api
echo.
pause
cls

vercel --prod
echo.

REM Resumen final
cls
echo.
echo ================================================================================
echo                        ^|*| DESPLIEGUE COMPLETADO ^|*|
echo ================================================================================
echo.
echo Tu aplicacion esta ahora en Vercel:
echo   Frontend:  https://[tu-app].vercel.app
echo   Backend:   !BACKEND_URL!/api
echo   BD:        Render (PostgreSQL)
echo.
echo Proximos pasos:
echo   1. Verifica que la aplicacion funciona correctamente
echo   2. Login con: admin / admin123
echo   3. Crea un ticket para probar
echo   4. Revisa los reportes y exportacion a Excel
echo.
echo Tu aplicacion esta lista para produccion! ^|*| ^|*| ^|*|
echo.
echo ================================================================================
pause
