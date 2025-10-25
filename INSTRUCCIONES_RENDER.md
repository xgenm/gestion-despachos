# Instrucciones para Desplegar la Base de Datos en Render

## Paso 1: Crear una Base de Datos PostgreSQL en Render

1. Visita [https://render.com](https://render.com) y crea una cuenta o inicia sesión.
2. Haz clic en "New" y selecciona "PostgreSQL".
3. Configura tu base de datos:
   - **Name**: Elige un nombre para tu base de datos (ej. `gestion-despachos-db`)
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Plan**: Selecciona el plan gratuito o uno de pago según tus necesidades
4. Haz clic en "Create Database".

## Paso 2: Obtener la Cadena de Conexión

1. Una vez creada la base de datos, ve a la página de tu base de datos en Render.
2. En la sección "Connection" haz clic en "Connect" y copia la cadena de conexión "External Connection String".
3. La cadena tendrá un formato similar a:
   ```
   postgresql://username:password@host:port/database
   ```

## Paso 3: Configurar Variables de Entorno en Vercel

1. En tu proyecto de Vercel, ve a "Settings" > "Environment Variables".
2. Agrega una nueva variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Pega la cadena de conexión que copiaste de Render
3. Guarda los cambios.

## Paso 4: Configurar el Despliegue Automático

1. Si aún no lo has hecho, conecta tu repositorio de GitHub a Vercel.
2. Configura el despliegue automático para que se active cuando hagas push a la rama principal.
3. Asegúrate de que la configuración de compilación apunte al directorio correcto (`backend`).

## Notas Importantes

- La cadena de conexión de Render contiene credenciales sensibles. Nunca la compartas públicamente.
- En el archivo `.env.example` encontrarás un ejemplo de cómo debe lucir la variable `DATABASE_URL`.
- Cuando realices cambios en las variables de entorno, necesitarás volver a desplegar tu aplicación en Vercel para que los cambios surtan efecto.