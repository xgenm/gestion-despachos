# 🚀 Guía de Inicio Rápido - Gestion de Despachos

## 📋 Credenciales de Acceso

### Usuario Predeterminado
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador (acceso completo)

### Credenciales de Base de Datos
- **Usuario**: `postgres`
- **Contraseña**: `postgres`
- **Base de Datos**: `gestion_despachos`
- **Host**: `localhost`
- **Puerto**: `5432`

---

## 🔧 Configuración Inicial (Primera vez)

### Paso 1: Configurar PostgreSQL
1. Abre una terminal (CMD o PowerShell)
2. Navega a la carpeta del proyecto:
   ```bash
   cd c:\Users\cr1st\Desktop\pedro\gestion-despachos
   ```
3. Ejecuta el script de configuración:
   ```bash
   configure-postgres.bat
   ```
4. Ingresa la contraseña actual de PostgreSQL cuando se te solicite
5. Espera a que se complete la configuración

### Paso 2: Instalar Dependencias (si es primera vez)
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

---

## ▶️ Iniciar la Aplicación

### Opción 1: Script Automático (Recomendado)
```bash
start-app.bat
```
Esto abrirá dos terminales:
- Una para el backend (puerto 3002)
- Una para el frontend (puerto 3001)

### Opción 2: Manual (Dos terminales)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Esperarás algo como:
```
Backend escuchando en http://localhost:3002
```

**Terminal 2 - Frontend:**
```bash
npm start
```
Esperarás que se abra el navegador automáticamente en `http://localhost:3001`

---

## 🌐 URLs de Acceso

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend | http://localhost:3001 | 3001 |
| Backend API | http://localhost:3002 | 3002 |
| Test API | http://localhost:3002/api/test | 3002 |
| Login | http://localhost:3001 | 3001 |

---

## 🧪 Prueba Rápida de Conexión

Si quieres verificar que PostgreSQL está funcionando:

```bash
# Navega a la carpeta del backend
cd backend

# Ejecuta el test de conexión
node test-db-connection.js
```

Deberías ver:
```
Intentando conectar a la base de datos...
¡Conexión exitosa!
Hora actual en la base de datos: 2025-10-27 14:30:45.123456
Conexión cerrada.
```

---

## 📊 Funcionalidad Disponible

### Para el Administrador (Usuario: admin)
✅ Crear y gestionar despachos  
✅ Generar facturas en PDF  
✅ Gestionar empleados  
✅ Administrar equipos, operarios y empresas  
✅ Ver reportes y estadísticas  

### Para los Empleados
✅ Ver y crear despachos  
✅ No tienen acceso a facturación ni administración  

---

## 🛠️ Crear Nuevo Usuario/Empleado

1. Inicia sesión como **admin**
2. Ve a **Gestión > Empleados**
3. Haz clic en **"Agregar Empleado"**
4. Completa el formulario:
   - **Nombre de usuario**: lucy (por ejemplo)
   - **Contraseña**: cualquier contraseña (mínimo 6 caracteres)
   - **Rol**: Selecciona "Empleado"
5. Haz clic en **"Crear Usuario"**

Luego puedes iniciar sesión con:
- **Usuario**: lucy
- **Contraseña**: (la que estableciste)

---

## 🐛 Solución de Problemas

### Error: "No se pudo conectar a la base de datos"
1. Verifica que PostgreSQL esté ejecutándose
2. Ejecuta `configure-postgres.bat` nuevamente
3. Verifica que el archivo `.env` en la carpeta `backend` tenga:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestion_despachos
   ```

### Error: "Cannot GET /api/auth/login"
- Asegúrate de que el backend esté ejecutándose en puerto 3002
- Verifica que hayas ejecutado `npm run dev` en la carpeta `backend`

### El frontend no carga en http://localhost:3001
- Verifica que no haya otra aplicación usando el puerto 3001
- Intenta con: `npm start` desde la raíz del proyecto

### Base de datos no existe
- Ejecuta `configure-postgres.bat` para crear la base de datos automáticamente

---

## 📝 Estructura de la Aplicación

```
├── frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/   (Componentes reutilizables)
│   │   ├── views/        (Páginas principales)
│   │   ├── contexts/     (Contextos de React)
│   │   └── App.tsx       (Componente principal)
│   └── ...
│
└── backend (Node.js + Express + TypeScript)
    ├── src/
    │   ├── routes/       (Endpoints de la API)
    │   ├── models/       (Modelos de datos)
    │   ├── middleware/   (Middleware de Express)
    │   ├── db/           (Conexión a BD)
    │   └── index.ts      (Servidor principal)
    └── ...
```

---

## 🔐 Seguridad en Desarrollo

⚠️ **IMPORTANTE**: Esta configuración es solo para desarrollo local

Para producción necesitarás:
- [ ] Cambiar credenciales predeterminadas
- [ ] Habilitar SSL/TLS
- [ ] Usar variables de entorno seguras
- [ ] Implementar HTTPS
- [ ] Usar contraseñas fuertes
- [ ] Implementar rate limiting

---

## 📞 Contacto y Soporte

Si encuentras problemas:
1. Revisa este documento
2. Verifica los logs en las terminales
3. Asegúrate de que PostgreSQL esté ejecutándose
4. Intenta ejecutar `configure-postgres.bat` nuevamente

---

**Versión**: 0.1.0  
**Última actualización**: 2025-10-27  
**Estado**: Listo para desarrollo local
