# Guía de Despliegue en Vercel + Render

## 📋 Requisitos Previos
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Render](https://render.com) (ya la tienes configurada)
- Git instalado
- Repositorio en GitHub

## 🚀 Pasos para Desplegar

### 1. Preparar el Repositorio

```bash
# Asegúrate de estar en la rama main/master
git checkout main

# Agregar cambios recientes
git add .
git commit -m "Agregado auto-guardado de clientes, camiones y empresas"
git push origin main
```

### 2. Desplegar Backend en Vercel

#### 2.1 Conectar repositorio en Vercel
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New" → "Project"
3. Selecciona tu repositorio de GitHub
4. Asegúrate de que la carpeta raíz es: `backend`

#### 2.2 Configurar Variables de Entorno
En la configuración del proyecto, agrega estas variables:

```
DATABASE_URL = postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require

JWT_SECRET = secreto_de_desarrollo_jwt_12345

DISABLE_AUTH = false

NODE_ENV = production
```

#### 2.3 Desplegar
- Click en "Deploy"
- Espera a que termine (~2-3 minutos)
- Anota la URL del backend (ej: `https://gestion-despachos-backend.vercel.app`)

---

### 3. Desplegar Frontend en Vercel

#### 3.1 Configurar variable de entorno
En el dashboard de Vercel, crea un nuevo proyecto:

1. Click en "Add New" → "Project"
2. Selecciona tu repositorio
3. **Asegúrate de que la carpeta raíz es: `.` (raíz del proyecto)**

#### 3.2 Variables de Entorno del Frontend
Agrega esta variable:

```
REACT_APP_API_URL = https://gestion-despachos-backend.vercel.app/api
```

*Reemplaza `gestion-despachos-backend` con el nombre de tu proyecto backend*

#### 3.3 Desplegar
- Click en "Deploy"
- Espera a que termine
- Obtendrás una URL como: `https://gestion-despachos.vercel.app`

---

## ✅ Verificar Despliegue

### Test 1: Backend está funcionando
```bash
curl https://gestion-despachos-backend.vercel.app/api/dispatches
```
Debe retornar JSON con los despachos

### Test 2: Frontend carga correctamente
1. Ve a `https://gestion-despachos.vercel.app`
2. Inicia sesión con: **admin / admin123**
3. Intenta crear un ticket
4. Verifica que se guarden los datos en Render

---

## 🔄 Actualizaciones Futuras

Después de hacer cambios en el código:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel se redesplegará automáticamente.

---

## 📊 Arquitectura de Producción

```
┌─────────────────────┐
│  Frontend (Vercel)  │
│  React + TypeScript │
└──────────┬──────────┘
           │
           │ HTTPS
           │
┌──────────▼──────────────────┐
│  Backend (Vercel Functions) │
│  Express + TypeScript       │
└──────────┬──────────────────┘
           │
           │ PostgreSQL
           │
┌──────────▼──────────────┐
│  Base de Datos (Render) │
│  PostgreSQL             │
└─────────────────────────┘
```

---

## 🛠️ Solución de Problemas

### Error: "Cannot find module"
- Ejecuta `npm install` en ambas carpetas
- Verifica que todos los imports están correctos

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` está correctamente configurada en Vercel
- Comprueba que Render está activo

### Frontend muestra errores de CORS
- Asegúrate de que `REACT_APP_API_URL` apunta al backend correcto
- Verifica que el backend tiene CORS habilitado

### DISABLE_AUTH debe ser `false` en producción
- Asegúrate de que en Vercel está configurado como `false`
- En local puedes mantenerlo como `true` para desarrollo

---

## 📝 Notas Importantes

✅ **Los datos persisten** en la base de datos de Render
✅ **Autenticación activa** (DISABLE_AUTH=false en producción)
✅ **HTTPS seguro** entre cliente y servidor
✅ **Base de datos en la nube** en Render

---

¡Tu aplicación está lista para producción! 🎉
