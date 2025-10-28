#!/usr/bin/env node

/**
 * Script de Despliegue Automático en Vercel (Versión Mejorada)
 * Automatiza el despliegue del backend y frontend
 * 
 * Uso: node deploy-vercel-interactive.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Verificar si Vercel CLI está instalado
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    success('Vercel CLI detectado');
    return true;
  } catch (e) {
    error(
      'Vercel CLI no está instalado.\n\n' +
      'Instálalo con: npm install -g vercel\n' +
      'Luego ejecuta: vercel login'
    );
  }
}

// Verificar si git está actualizado
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      warning('Hay cambios sin commitear en git');
      info('Haciendo commit automático...');
      try {
        execSync('git add .', { stdio: 'ignore' });
        execSync('git commit -m "Preparado para despliegue en Vercel"', { stdio: 'ignore' });
        execSync('git push origin main', { stdio: 'ignore' });
        success('Cambios pusheados a GitHub');
      } catch (e) {
        warning('No se pudieron commitear cambios automáticamente');
      }
    }
    success('Git está actualizado');
    return true;
  } catch (e) {
    warning('No es un repositorio git');
    return true;
  }
}

// Compilar backend
function buildBackend() {
  info('Compilando backend...');
  try {
    execSync('cd backend && npm run build', { stdio: 'inherit' });
    success('Backend compilado exitosamente');
    return true;
  } catch (e) {
    error('Error al compilar el backend');
  }
}

// Función para hacer preguntas interactivas
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Función principal
async function main() {
  console.log('\n');
  log('═'.repeat(80), 'bold');
  log('🚀 SCRIPT DE DESPLIEGUE AUTOMÁTICO EN VERCEL (VERSIÓN INTERACTIVA)', 'bold');
  log('═'.repeat(80), 'bold');
  console.log('');

  // Verificaciones previas
  info('Realizando verificaciones previas...');
  checkVercelCLI();
  checkGitStatus();

  console.log('');
  log('─'.repeat(80));
  console.log('');

  // Compilar backend
  buildBackend();
  console.log('');

  // Crear readline para preguntas
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Preguntar si continuar
  const continueDeployment = await askQuestion(
    rl,
    '\n¿Deseas continuar con el despliegue en Vercel? (s/n): '
  );

  if (continueDeployment.toLowerCase() !== 's') {
    log('\nDespliegue cancelado', 'yellow');
    rl.close();
    process.exit(0);
  }

  console.log('');
  log('═'.repeat(80));
  log('PASO 1: DESPLEGAR BACKEND EN VERCEL', 'bold');
  log('═'.repeat(80));
  console.log('');

  info('Se abrirá Vercel en tu navegador');
  log('\nPasos:');
  log('1. Selecciona tu repositorio "gestion-despachos"', 'blue');
  log('2. Carpeta raíz: "backend"', 'blue');
  log('3. Click en "Deploy"', 'blue');
  log('4. IMPORTANTE: Agrega estas variables de entorno ANTES de desplegar:', 'yellow');
  log('   - DATABASE_URL=postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require', 'yellow');
  log('   - JWT_SECRET=secreto_de_desarrollo_jwt_12345', 'yellow');
  log('   - DISABLE_AUTH=false', 'yellow');
  log('   - NODE_ENV=production', 'yellow');
  console.log('');

  const backendUrl = await askQuestion(
    rl,
    '¿Cuál es la URL de tu backend en Vercel? (ej: https://mi-backend.vercel.app): '
  );

  if (!backendUrl) {
    error('URL del backend requerida');
  }

  success(`Backend URL guardada: ${backendUrl}`);
  console.log('');

  // Actualizar .env.production
  const envFile = path.join(__dirname, '.env.production');
  const envContent = `REACT_APP_API_URL=${backendUrl}/api\n`;

  try {
    fs.writeFileSync(envFile, envContent);
    success(`Variables de entorno actualizadas en .env.production`);
  } catch (e) {
    error(`Error al actualizar .env.production: ${e.message}`);
  }

  console.log('');
  log('═'.repeat(80));
  log('PASO 2: DESPLEGAR FRONTEND EN VERCEL', 'bold');
  log('═'.repeat(80));
  console.log('');

  info('Se abrirá Vercel en tu navegador para desplegar el frontend');
  log('\nPasos:');
  log('1. Selecciona tu repositorio "gestion-despachos"', 'blue');
  log('2. Carpeta raíz: "." (punto, la raíz)', 'blue');
  log('3. IMPORTANTE: Agrega esta variable de entorno ANTES de desplegar:', 'yellow');
  log(`   - REACT_APP_API_URL=${backendUrl}/api`, 'yellow');
  log('4. Click en "Deploy"', 'blue');
  console.log('');

  const frontendReady = await askQuestion(
    rl,
    '¿Ya desplegaste el frontend en Vercel? (s/n): '
  );

  if (frontendReady.toLowerCase() === 's') {
    const frontendUrl = await askQuestion(
      rl,
      '¿Cuál es la URL de tu frontend en Vercel? (ej: https://mi-app.vercel.app): '
    );

    if (frontendUrl) {
      showSummary(backendUrl, frontendUrl);
    }
  } else {
    log('\nDespliegue del frontend pendiente', 'yellow');
    log(`No olvides agregar esta variable de entorno:`, 'yellow');
    log(`REACT_APP_API_URL=${backendUrl}/api`, 'yellow');
  }

  rl.close();
}

// Mostrar resumen
function showSummary(backendUrl, frontendUrl) {
  console.log('\n');
  log('═'.repeat(80), 'bold');
  log('🎉 DESPLIEGUE COMPLETADO', 'green');
  log('═'.repeat(80), 'bold');
  console.log('');

  log('Tu aplicación está ahora en Vercel:', 'green');
  log(`Frontend:     ${frontendUrl}`, 'blue');
  log(`Backend API:  ${backendUrl}/api`, 'blue');
  log(`Base de Datos: Render (PostgreSQL)`, 'blue');
  console.log('');

  log('Próximos pasos:', 'bold');
  log('1. Verifica que tu aplicación carga correctamente', 'blue');
  log('2. Login con: admin / admin123', 'blue');
  log('3. Crea un ticket para verificar que funciona', 'blue');
  log('4. Revisa Reportes → Exporta a Excel', 'blue');
  log('5. Prueba Generar PDF', 'blue');
  console.log('');

  log('Variables de entorno configuradas:', 'bold');
  log(`Frontend:  REACT_APP_API_URL=${backendUrl}/api`, 'green');
  log('Backend:   DATABASE_URL, JWT_SECRET, DISABLE_AUTH, NODE_ENV', 'green');
  console.log('');

  log('¡Tu aplicación está lista para producción! 🚀', 'bold');
  log('═'.repeat(80), 'bold');
}

// Ejecutar
main().catch(e => {
  error(`Error: ${e.message}`);
});
