# 📤 Preparar Repositorio Git para Vercel

Si aún no has pusheado tu código a GitHub, sigue estos pasos:

## 1️⃣ Verificar Estado de Git

```bash
cd c:\Users\cr1st\Desktop\pedro\gestion-despachos
git status
```

## 2️⃣ Configurar Git (primera vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

## 3️⃣ Inicializar Repositorio (si no existe)

```bash
git init
git add .
git commit -m "Inicial: Aplicación de gestión de despachos"
git branch -M main
git remote add origin https://github.com/tu-usuario/gestion-despachos.git
git push -u origin main
```

## 4️⃣ Actualizar Cambios Recientes

```bash
git add .
git commit -m "Agregado auto-guardado de clientes y camiones"
git push origin main
```

## 5️⃣ Verificar en GitHub

1. Ve a https://github.com/tu-usuario/gestion-despachos
2. Verifica que los cambios están ahí
3. Tienes dos opciones:

   **Opción A: Privado** (recomendado para secretos)
   - Hazlo privado en Settings → Visibility

   **Opción B: Público**
   - Asegúrate de NO incluir `.env` en git
   - El `.env` debe estar en `.gitignore`

## 6️⃣ Verificar .gitignore

Crea un archivo `.gitignore` en la raíz del proyecto:

```
# Variables de entorno
.env
.env.local
.env.*.local

# Dependencies
node_modules/
*/node_modules/

# Build
dist/
build/
*/dist/
*/build/

# Logs
npm-debug.log*
yarn-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
```

## 7️⃣ Hacer Push sin .env

```bash
# Si accidentalmente incluiste .env, remuerelo:
git rm --cached .env
git commit -m "Removido .env de git"
git push origin main
```

---

## ✅ Una vez en GitHub

Ya puedes ir a Vercel y conectar tu repositorio:

1. https://vercel.com/dashboard
2. Click en "Add New" → "Project"
3. "Import Git Repository"
4. Selecciona tu repositorio
5. Configura variables de entorno
6. Deploy! 🚀

---

**Importante:** Nunca pusheés archivos `.env` con secretos a GitHub publicamente.
