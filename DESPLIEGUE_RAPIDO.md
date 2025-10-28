# ⚡ Despliegue Rápido en Vercel

## 1️⃣ Backend (gestion-despachos-backend)

```bash
# En Vercel:
Nombre: gestion-despachos-backend
Carpeta raíz: backend
```

**Variables de Entorno:**
```
DATABASE_URL = postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require
JWT_SECRET = secreto_de_desarrollo_jwt_12345
DISABLE_AUTH = false
NODE_ENV = production
```

## 2️⃣ Frontend (gestion-despachos)

```bash
# En Vercel:
Nombre: gestion-despachos
Carpeta raíz: . (root)
```

**Variables de Entorno:**
```
REACT_APP_API_URL = https://gestion-despachos-backend.vercel.app/api
```

## 3️⃣ Verificar

1. Frontend: https://gestion-despachos.vercel.app
2. Login: **admin / admin123**
3. Crear un ticket para probar

---

## 📌 URLs Finales

- **Frontend:** https://gestion-despachos.vercel.app
- **Backend:** https://gestion-despachos-backend.vercel.app/api
- **Base de Datos:** Render (PostgreSQL)

---

¡Listo para producción! 🚀
