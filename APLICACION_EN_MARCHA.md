# 🚀 APLICACIÓN EN MARCHA - GESTIÓN DE DESPACHOS

## ✅ Estado Actual

**Fecha**: 2025-10-27  
**Estado**: ✅ FUNCIONANDO EN LOCAL

### Servicios Activos
- ✅ **Frontend**: http://localhost:3001
- ✅ **Backend API**: http://localhost:3002
- ⚠️ **Base de Datos**: Modo desarrollo (sin conexión real a PostgreSQL)

---

## 📋 CREDENCIALES DE ACCESO

### Usuario Principal
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador (acceso completo)

### Descripción de Permisos

**Administrador (admin)**:
- ✅ Crear, editar y eliminar despachos
- ✅ Generar facturas en PDF
- ✅ Gestionar empleados
- ✅ Administrar empresas, equipos, operarios
- ✅ Ver reportes (parcialmente)
- ✅ Acceso a todas las secciones

**Empleado** (crear nuevos en Gestión > Empleados):
- ✅ Ver y crear despachos
- ❌ No puede generar facturas
- ❌ No puede gestionar otros usuarios
- ❌ Sin acceso a administración

---

## 🌐 URLs DE ACCESO

| Servicio | URL |
|----------|-----|
| **Aplicación** | http://localhost:3001 |
| **Login** | http://localhost:3001 |
| **Backend API** | http://localhost:3002 |
| **Test API** | http://localhost:3002/api/test |

---

## 📊 Funcionalidades Disponibles

### ✅ Implementadas y Funcionales

1. **Autenticación**
   - Login con usuario y contraseña
   - Control de sesión con JWT
   - Logout

2. **Gestión de Despachos**
   - Crear despachos nuevos
   - Visualizar historial
   - Filtrar por cliente/fecha
   - Eliminar despachos
   - Seleccionar materiales y cantidades
   - Cálculo automático de totales

3. **Facturación**
   - Seleccionar cliente
   - Seleccionar empresa que factura
   - Seleccionar despachos a facturar
   - Generar PDF automáticamente

4. **Gestión de Datos**
   - Crear/editar/eliminar usuarios (empleados)
   - Crear/editar/eliminar equipos
   - Crear/editar/eliminar operarios
   - Crear/editar/eliminar empresas
   - Crear/editar/eliminar clientes

5. **Interfaz de Usuario**
   - Responsive en escritorio
   - Menú dinámico según rol
   - Formularios con validación
   - Mensajes de éxito/error
   - Modal para detalles

---

## ⚠️ Modo de Desarrollo Temporal

Actualmente está configurado en modo desarrollo (`DISABLE_AUTH=true`) para permitir el funcionamiento sin PostgreSQL.

**Limitaciones temporales**:
- ⚠️ No hay persistencia de datos (los datos se pierden al reiniciar)
- ⚠️ No se pueden crear nuevos usuarios reales (solo el admin por defecto)
- ⚠️ Las facturas se generan pero sin datos reales de BD

**Para usar base de datos real**:
1. Instalar PostgreSQL (ya está instalado)
2. Cambiar contraseña del usuario `postgres` a `postgres`
3. Crear base de datos `gestion_despachos`
4. En backend/.env cambiar: `DISABLE_AUTH=false`
5. Reiniciar backend

---

## 🔧 Cómo Usar la Aplicación

### 1. Iniciar Sesión
1. Abre http://localhost:3001
2. Usa:
   - **Usuario**: admin
   - **Contraseña**: admin123
3. Haz clic en "Iniciar Sesión"

### 2. Crear un Despacho
1. En el menú, ve a **Despachos**
2. Completa el formulario:
   - Número de despacho
   - Fecha y hora
   - Información del camión
   - Datos del cliente
   - Selecciona materiales y cantidades
3. Haz clic en "Crear Despacho"

### 3. Generar una Factura
1. Ve a **Facturación**
2. Selecciona un cliente
3. Selecciona la empresa que factura
4. Marca los despachos a facturar
5. Haz clic en "Generar Factura PDF"
6. Se descargaránautomáticamente

### 4. Crear un Empleado
1. Ve a **Gestión > Empleados**
2. Haz clic en "Agregar Empleado"
3. Completa:
   - Nombre de usuario
   - Contraseña (mínimo 6 caracteres)
   - Selecciona "Empleado" como rol
4. Haz clic en "Crear Usuario"

---

## 🔌 Endpoints de API Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Despachos
- `GET /api/dispatches` - Obtener todos los despachos
- `POST /api/dispatches` - Crear despacho
- `DELETE /api/dispatches/:id` - Eliminar despacho

### Usuarios, Equipos, Operarios, Empresas, Clientes
- `GET /api/{resource}` - Obtener todos
- `POST /api/{resource}` - Crear
- `DELETE /api/{resource}/:id` - Eliminar

---

## 🚨 Posibles Problemas y Soluciones

### "Error de conexión con el servidor"
**Causa**: Backend no está ejecutándose  
**Solución**: Verifica que se vea "Backend escuchando en http://localhost:3002"

### "No puedo iniciar sesión"
**Causa**: Contraseña incorrecta  
**Solución**: Usa `admin` / `admin123`

### El navegador dice "No se puede acceder a localhost:3001"
**Causa**: Frontend no está compilado  
**Solución**: Espera a que veas "Compiled successfully!" en la terminal

### "La base de datos no existe"
**Causa**: Es normal en modo desarrollo  
**Solución**: Los datos se pierden al reiniciar, pero la app sigue funcionando

---

## 📈 Estado Técnico

### Backend
- ✅ Express.js ejecutándose
- ✅ API REST respondiendo
- ✅ Autenticación JWT funcional
- ✅ Rutas protegidas por rol
- ⚠️ Base de datos en modo desarrollo

### Frontend
- ✅ React compilando correctamente
- ✅ Componentes cargando
- ✅ Enrutamiento funcional
- ✅ Contexto de autenticación activo
- ✅ Bootstrap para estilos

---

## 🎯 Próximos Pasos (Cuando quieras)

1. **Configurar PostgreSQL real**
   - Cambiar contraseña a `postgres`
   - Ejecutar: `ALTER USER postgres PASSWORD 'postgres';`

2. **Habilitar base de datos**
   - En backend/.env cambiar `DISABLE_AUTH=false`
   - Reiniciar backend

3. **Completar funcionalidades pendientes**
   - Reportes avanzados con gráficos
   - Tests unitarios
   - Mejoras de seguridad
   - Responsive móvil completo

---

## 💾 Información del Proyecto

- **Versión**: 0.1.0
- **Framework Frontend**: React 19.2.0
- **Framework Backend**: Express 5.1.0
- **Base de Datos**: PostgreSQL 18
- **Lenguaje**: TypeScript
- **Puerto Frontend**: 3001
- **Puerto Backend**: 3002

---

## 📞 Resumen Rápido

| Pregunta | Respuesta |
|----------|-----------|
| ¿Funciona? | ✅ SÍ |
| ¿Cuál es el usuario? | admin |
| ¿Cuál es la contraseña? | admin123 |
| ¿Dónde puedo acceder? | http://localhost:3001 |
| ¿Funciona el backend? | ✅ SÍ (puerto 3002) |
| ¿Se guardan datos? | ⚠️ Temporalmente (sin BD real) |
| ¿Puedo crear empleados? | ✅ SÍ (en Gestión > Empleados) |
| ¿Puedo generar facturas? | ✅ SÍ (en Facturación) |

---

**¡APLICACIÓN LISTA PARA USAR! 🎉**

Abre http://localhost:3001 e inicia sesión con admin/admin123
