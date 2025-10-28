# ✅ Checklist de Despliegue a Vercel + Render

## 🔍 Verificación Local

- [x] Backend compila sin errores (`npm run build`)
- [x] Frontend compila sin errores (`npm start`)
- [x] Base de datos en Render está activa
- [x] Autenticación funciona (admin/admin123)
- [x] Se pueden crear tickets
- [x] Se guardan datos automáticamente (clientes, camiones)
- [x] Los reportes avanzados funcionan
- [x] Se pueden exportar a Excel

## 🔐 Configuración de Seguridad

- [x] `DISABLE_AUTH=false` en backend/.env (producción)
- [x] `DATABASE_URL` apunta a Render (con sslmode=require)
- [x] JWT_SECRET está configurado
- [x] Variables de entorno están en `.env` (no en git)

## 📁 Archivos Configurados

- [x] `backend/vercel.json` - Configurado para Vercel
- [x] `backend/package.json` - Tiene script de build
- [x] `.env.production` - Apunta a backend de Vercel
- [x] `backend/.env.example` - Documentación de variables

## 🚀 Pasos de Despliegue

### Backend en Vercel

1. Ve a https://vercel.com/dashboard
2. Click en "Add New" → "Project"
3. Selecciona tu repositorio GitHub
4. **Carpeta raíz:** `backend`
5. **Variables de entorno:**
   - `DATABASE_URL`: Tu connection string de Render
   - `JWT_SECRET`: Tu JWT secret
   - `DISABLE_AUTH`: `false`
   - `NODE_ENV`: `production`
6. Click en "Deploy"
7. **Anota la URL del backend**

### Frontend en Vercel

1. Click en "Add New" → "Project"
2. Selecciona tu repositorio GitHub
3. **Carpeta raíz:** `.` (raíz)
4. **Variables de entorno:**
   - `REACT_APP_API_URL`: `https://tu-backend-vercel.app/api`
5. Click en "Deploy"
6. **Anota la URL del frontend**

## ✔️ Verificación Post-Despliegue

- [ ] Frontend carga sin errores
- [ ] Login funciona (admin/admin123)
- [ ] Se pueden crear tickets
- [ ] Los datos se guardan en Render
- [ ] Se pueden ver reportes
- [ ] Se pueden descargar reportes en Excel
- [ ] HTTPS funciona en ambas URLs

## 📊 URLs Finales

- **Frontend:** https://tu-frontend-vercel.app
- **Backend:** https://tu-backend-vercel.app/api
- **Base de Datos:** Render (PostgreSQL)

## 🆘 Si algo falla

1. Verifica que las variables de entorno están correctas en Vercel
2. Revisa los logs en Vercel Dashboard
3. Asegúrate de que Render está activo
4. Intenta redesplegando manualmente

---

**Estado:** ✅ Listo para desplegar
