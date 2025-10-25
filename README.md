# Sistema de Gestión de Despachos

Sistema de gestión de despachos para empresa constructora con frontend en React y backend en Node.js/Express con autenticación JWT.

## Estructura del Proyecto

- `backend/`: API RESTful con Node.js, Express y PostgreSQL
- `src/`: Aplicación frontend en React con TypeScript
- `public/`: Archivos estáticos

## Configuración Automática del Entorno de Desarrollo

### Usando Scripts de Automatización (Windows)

1. **Configuración inicial**:
   ```
   setup-dev.bat
   ```
   Este script instalará todas las dependencias y creará los archivos de configuración necesarios.

2. **Iniciar entorno de desarrollo**:
   ```
   start-dev.bat
   ```
   Este script iniciará automáticamente tanto el backend como el frontend en terminales separadas.

### Configuración Manual

#### Backend

1. Navega a la carpeta del backend:
   ```
   cd backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example` y configura tu conexión a la base de datos PostgreSQL

4. Inicia el servidor en modo desarrollo:
   ```
   npm run dev
   ```

   El backend estará disponible en http://localhost:3002

#### Frontend

1. Desde la raíz del proyecto, instala las dependencias:
   ```
   npm install
   ```

2. Inicia la aplicación en modo desarrollo:
   ```
   npm start
   ```

   La aplicación estará disponible en http://localhost:3000

## Configuración de Base de Datos

El sistema está configurado para usar PostgreSQL. Para desarrollo, puedes:

1. **Usar una base de datos en la nube (recomendado para desarrollo)**:
   - Sigue las instrucciones en [CONFIGURAR_BASE_DATOS.md](CONFIGURAR_BASE_DATOS.md)
   - Crea una base de datos gratuita en Render
   - Actualiza tu archivo `backend/.env` con la cadena de conexión

2. **Instalar PostgreSQL localmente**:
   - Descarga e instala PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/)
   - Crea una base de datos llamada `gestion_despachos`
   - Configura el archivo `backend/.env` con tus credenciales locales

## Sistema de Autenticación

El sistema utiliza autenticación JWT (JSON Web Tokens) para proteger las rutas y datos:

1. **Registro de administradores**: 
   - Solo se puede registrar un administrador a través del endpoint `/api/auth/register`
   - Este endpoint está protegido y requiere un token válido

2. **Inicio de sesión**:
   - Los usuarios inician sesión en `/api/auth/login`
   - Se recibe un token JWT que debe ser incluido en el header de las solicitudes

3. **Protección de rutas**:
   - Todas las rutas de la API (excepto `/api/auth`) requieren un token válido
   - El frontend verifica la presencia de un token en localStorage

## Despliegue

### Backend en Vercel con Base de Datos en Render

1. Sigue las instrucciones en [INSTRUCCIONES_RENDER.md](INSTRUCCIONES_RENDER.md) para configurar la base de datos en Render
2. Sigue las instrucciones en [INSTRUCCIONES_VERCEL.md](INSTRUCCIONES_VERCEL.md) para desplegar el backend en Vercel

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
REACT_APP_API_URL=http://localhost:3002/api
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos
JWT_SECRET=secreto_para_jwt
PORT=3002
```

Puedes usar el archivo [.env.example](.env.example) como referencia.

## Primer Uso

1. Ejecuta `setup-dev.bat` para configurar el entorno
2. Ejecuta `start-dev.bat` para iniciar el entorno de desarrollo
3. Accede a la aplicación en http://localhost:3000
4. Serás redirigido a la página de login
5. Registra un administrador usando el formulario en "Gestión" > "Administradores"
6. Inicia sesión con las credenciales creadas

## Scripts Disponibles

### Scripts de Automatización (Windows)
- `setup-dev.bat`: Configura el entorno de desarrollo
- `start-dev.bat`: Inicia el entorno de desarrollo
- `init-db.bat`: Inicializa la base de datos de desarrollo

### Backend

- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm run build`: Compila el TypeScript a JavaScript
- `npm start`: Inicia el servidor compilado

### Frontend

- `npm start`: Inicia la aplicación en modo desarrollo
- `npm test`: Ejecuta las pruebas en modo interactivo
- `npm run build`: Construye la aplicación para producción
- `npm run eject`: Elimina la dependencia de Create React App (operación irreversible)