# Script para ejecutar el entorno completo LOCAL (privado)
# Backend + Frontend sin conexión a servicios externos

Write-Host "🚀 Iniciando entorno de desarrollo LOCAL privado..." -ForegroundColor Cyan

# 1. Iniciar el backend en modo desarrollo (sin auth, SQLite local)
Write-Host "`n📦 Iniciando backend local..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Esperar 3 segundos para que el backend inicie
Start-Sleep -Seconds 3

# 2. Iniciar el frontend
Write-Host "`n🌐 Iniciando frontend local..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host "`n✅ Entorno LOCAL iniciado:" -ForegroundColor Green
Write-Host "   • Backend: http://localhost:3002" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "`n💡 Todo funciona SIN CONEXIÓN a Netlify/Railway" -ForegroundColor Cyan
Write-Host "   Base de datos: SQLite local (backend/dev.db)" -ForegroundColor Gray
