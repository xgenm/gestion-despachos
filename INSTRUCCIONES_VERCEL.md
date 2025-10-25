# Instrucciones para Desplegar en Vercel

## Paso 1: Preparar el Proyecto

1. Asegúrate de que tu proyecto tenga la estructura correcta:
   - El backend debe estar en la carpeta `backend/`
   - El frontend debe estar en la raíz del proyecto

2. Verifica que el archivo `vercel.json` exista en la carpeta `backend/` con la configuración correcta.

## Paso 2: Crear un Proyecto en Vercel

1. Visita [https://vercel.com](https://vercel.com) y crea una cuenta o inicia sesión.
2. Haz clic en "New Project".
3. Importa tu repositorio de GitHub, GitLab o Bitbucket.
4. Selecciona el repositorio correcto.

## Paso 3: Configurar el Proyecto

1. En la configuración del proyecto:
   - **Build and Output Settings**:
     - Framework Preset: `Other`
     - Root Directory: `backend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. En las variables de entorno, agrega:
   - `DATABASE_URL`: La cadena de conexión a tu base de datos en Render

## Paso 4: Desplegar

1. Haz clic en "Deploy".
2. Vercel compilará e implementará tu aplicación.
3. Una vez completado, recibirás una URL donde se puede acceder a tu backend.

## Paso 5: Configurar el Frontend (Opcional)

Si también deseas desplegar el frontend en Vercel:

1. Crea un nuevo proyecto en Vercel.
2. Selecciona la raíz del proyecto (no la carpeta backend).
3. Configura las variables de entorno necesarias:
   - `REACT_APP_API_URL`: La URL de tu backend desplegado en Vercel

## Notas Importantes

- Asegúrate de que todas las dependencias estén listadas correctamente en `package.json`.
- El despliegue automático se activará cada vez que hagas push a tu repositorio.
- Puedes tener ramas de previsualización configurando el despliegue para diferentes ramas de Git.