# Cómo Configurar una Base de Datos PostgreSQL en Render

## Paso 1: Crear una Cuenta en Render

1. Visita [https://render.com](https://render.com)
2. Haz clic en "Sign Up" para crear una cuenta gratuita
3. Completa el proceso de registro

## Paso 2: Crear una Base de Datos PostgreSQL

1. Una vez iniciada la sesión, haz clic en "New" y selecciona "PostgreSQL"
2. Configura los siguientes parámetros:
   - **Name**: `gestion-despachos-db`
   - **Region**: Selecciona la región más cercana a ti
   - **Plan**: Selecciona el plan gratuito (Free) para desarrollo
3. Haz clic en "Create Database"

## Paso 3: Obtener la Cadena de Conexión

1. Una vez creada la base de datos, ve a la página de tu base de datos en el dashboard de Render
2. En la sección "Connection", encontrarás la cadena de conexión
3. Copia la cadena de conexión "External Connection String"

## Paso 4: Actualizar el Archivo .env

1. Abre el archivo `backend/.env` en tu proyecto
2. Reemplaza la línea `DATABASE_URL=...` con la cadena de conexión que copiaste de Render
3. Guarda el archivo

## Paso 5: Reiniciar el Servidor

1. Detén el servidor backend si está corriendo (Ctrl+C)
2. Inicia nuevamente el servidor con:
   ```
   cd backend
   npm run dev
   ```

## Notas Importantes

- La base de datos gratuita en Render puede tener algunas limitaciones
- Asegúrate de no compartir la cadena de conexión públicamente
- La cadena de conexión contiene credenciales sensibles
- En el archivo `.env`, nunca subas tus credenciales a un repositorio público

## Problemas Comunes y Soluciones

### Error de Conexión SSL
Si encuentras errores relacionados con SSL, puedes deshabilitar la verificación SSL añadiendo `?sslmode=no-verify` al final de tu cadena de conexión.

### Tiempo de Espera de Conexión
Las bases de datos gratuitas pueden tardar un momento en responder. El sistema está configurado para reintentar automáticamente la conexión cada 30 segundos si falla inicialmente.