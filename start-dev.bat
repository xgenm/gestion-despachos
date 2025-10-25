@echo off
echo Iniciando entorno de desarrollo...

REM Abrir una nueva ventana de terminal para el backend
start "Backend" cmd /k "cd backend && npm run dev"

REM Esperar unos segundos para que el backend se inicie
timeout /t 5 /nobreak >nul

REM Iniciar el frontend en la ventana actual
cd c:\Users\cr1st\Desktop\pedro\gestion-despachos
npm start