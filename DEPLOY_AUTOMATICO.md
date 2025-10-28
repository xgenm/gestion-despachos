# 🚀 Script de Despliegue Automático en Vercel

Este repositorio incluye scripts para automatizar completamente el despliegue en Vercel.

## 📋 Requisitos Previos

Antes de ejecutar los scripts, asegúrate de tener:

### 1. Git Configurado
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 2. Vercel CLI Instalado
```bash
npm install -g vercel
```

### 3. Repositorio en GitHub
Tu código debe estar en GitHub. Si no lo está:
```bash
git remote add origin https://github.com/tu-usuario/gestion-despachos.git
git push -u origin main
```

### 4. Vercel CLI Autenticado
```bash
vercel login
```

---

## 🎯 Uso de los Scripts

### Opción 1: Windows (Recomendado)

**Ejecutar:**
```bash
deploy-vercel.bat
```

**Qué hace:**
1. ✅ Verifica que Vercel CLI esté instalado
2. ✅ Verifica el estado de Git
3. ✅ Compila el backend
4. ✅ Te pide que configures variables en Vercel Dashboard
5. ✅ Despliega el backend
6. ✅ Te pide la URL del backend
7. ✅ Actualiza `.env.production`
8. ✅ Despliega el frontend
9. ✅ Muestra resumen final

---

### Opción 2: Node.js (Multiplataforma)

**Instalación:**
```bash
npm install -g node
```

**Ejecutar:**
```bash
node deploy-vercel.js
```

**O más simple:**
```bash
npm run deploy:vercel
```

*(Si agregaste el script a package.json)*

---

## 🔧 Agregar Script a package.json

Para ejecutar el script más fácilmente, puedes agregar esto a `package.json`:

```json
{
  "scripts": {
    "deploy:vercel": "node deploy-vercel.js"
  }
}
```

Luego ejecutar:
```bash
npm run deploy:vercel
```

---

## 📊 Variables de Entorno Automáticas

El script automáticamente:

### Para Backend:
- Solicita que configures en Vercel Dashboard:
  ```
  DATABASE_URL=postgresql://...
  JWT_SECRET=secreto_de_desarrollo_jwt_12345
  DISABLE_AUTH=false
  NODE_ENV=production
  ```

### Para Frontend:
- Genera `.env.production` automáticamente con:
  ```
  REACT_APP_API_URL=[TU-BACKEND-URL]/api
  ```

---

## ⚙️ Flujo del Script Automático

```
┌─────────────────────────────────────┐
│ 1. Verificaciones Previas           │
│    • Vercel CLI instalado?          │
│    • Git actualizado?               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 2. Compilar Backend                 │
│    npm run build                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 3. Desplegar Backend en Vercel      │
│    vercel --prod (carpeta: backend) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 4. Obtener URL del Backend          │
│    ¿Cuál es tu URL de backend?      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 5. Desplegar Frontend en Vercel     │
│    vercel --prod (carpeta: .)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 6. Mostrar Resumen Final            │
│    ✅ Despliegue Completado         │
└─────────────────────────────────────┘
```

---

## 🎯 Pasos Manual vs Automático

### Manual (Sin Script)
1. Compilar backend: `npm run build` (en carpeta backend)
2. Abrir Vercel: https://vercel.com/dashboard
3. Crear proyecto 1 para backend
4. Crear proyecto 2 para frontend
5. Configurar 4+ variables de entorno
6. Actualizar .env.production manualmente
7. **Total: 15-20 minutos**

### Automático (Con Script)
1. Ejecutar: `deploy-vercel.bat`
2. Seguir prompts interactivos
3. **Total: 5-10 minutos**

---

## 🆘 Solución de Problemas

### "Vercel CLI no está instalado"
```bash
npm install -g vercel
```

### "No autenticado en Vercel"
```bash
vercel login
```

### "Cambios sin commitear"
```bash
git add .
git commit -m "Tu mensaje"
git push origin main
```

### "Error compilando backend"
```bash
cd backend
npm install
npm run build
```

### "¿Cuál es la URL del backend?" (Error en script)
**Solución:** El script te va a pedir que escribas la URL que Vercel te muestre. Cópiala y pégala en el prompt.

---

## 📝 Ejemplo de Ejecución

```
$ deploy-vercel.bat

================================================================================
                    |*| SCRIPT DE DESPLIEGUE EN VERCEL |*|
================================================================================

[INFO] Verificando si Vercel CLI está instalado...
[OK] Vercel CLI detectado

[INFO] Verificando estado de Git...
[OK] Git está actualizado

[INFO] Compilando backend...
> backend@1.0.0 build
> tsc

[OK] Backend compilado

================================================================================
[INFO] Desplegando BACKEND en Vercel...
================================================================================

Recuerda configurar estas variables...

[Se abre Vercel en el navegador]

[INFO] Ingresa la URL de tu backend: https://gestion-backend.vercel.app

[INFO] Actualizando .env.production...
[OK] .env.production actualizado

================================================================================
[INFO] Desplegando FRONTEND en Vercel...
================================================================================

[Se abre Vercel en el navegador nuevamente]

================================================================================
                       |*| DESPLIEGUE COMPLETADO |*|
================================================================================

Tu aplicacion esta ahora en Vercel:
  Frontend:  https://gestion-app.vercel.app
  Backend:   https://gestion-backend.vercel.app/api
  BD:        Render (PostgreSQL)
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- El `.env.production` contiene `REACT_APP_API_URL` que es PÚBLICO (necesario para el frontend)
- El archivo `.env` con secretos NO se commits a git (está en `.gitignore`)
- Las variables sensibles se configuran en Vercel Dashboard, NO en el código

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que cumples con los requisitos previos
2. Revisa la solución de problemas arriba
3. Asegúrate de que tu red permite acceder a Vercel
4. Intenta ejecutar manualmente si el script falla

---

## 📚 Archivos Relacionados

- `PROXIMOS_PASOS.txt` - Guía paso a paso
- `ESTADO_GITHUB.md` - Estado actual del repositorio
- `backend/vercel.json` - Configuración de Vercel para el backend
- `.env.production` - Variables para el frontend

---

**Estado:** ✅ Scripts Listos  
**Última Actualización:** 2025-10-27  
**Versión:** 1.0
