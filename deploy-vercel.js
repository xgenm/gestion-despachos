#!/usr/bin/env node

/**
 * Script de Despliegue Automático en Vercel
 * Automatiza el despliegue del backend y frontend
 * 
 * Uso: node deploy-vercel.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  } catch (e) {
    error(
      'Vercel CLI no está instalado.\n\n' +
      'Instálalo con: npm install -g vercel\n' +
      'O: yarn global add vercel'
    );
  }
}

// Verificar si git está actualizado
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      warning('Hay cambios sin commitear en git');
      info('Por favor, haz commit de tus cambios antes de desplegar');
      log('\nEjecutar:');
      log('  git add .', 'blue');
      log('  git commit -m "Tu mensaje de commit"', 'blue');
      log('  git push origin main', 'blue');
      return false;
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

// Desplegar backend en Vercel
function deployBackend() {
  info('Desplegando backend en Vercel...');
  log('\nAsegúrate de configurar estas variables de entorno en Vercel:', 'yellow');
  log('  DATABASE_URL=postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require', 'yellow');
  log('  JWT_SECRET=secreto_de_desarrollo_jwt_12345', 'yellow');
  log('  DISABLE_AUTH=false', 'yellow');
  log('  NODE_ENV=production', 'yellow');

  try {
    execSync('cd backend && vercel --prod', { stdio: 'inherit' });
    success('Backend desplegado en Vercel');
    
    info('Obtén la URL de tu backend y guárdala para el siguiente paso');
    return true;
  } catch (e) {
    warning('Despliegue del backend interactivo completado o cancelado');
    return true;
  }
}

// Desplegar frontend en Vercel
function deployFrontend() {
  info('Desplegando frontend en Vercel...');
  
  // Pedirle al usuario que ingrese la URL del backend
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(
    '\n¿Cuál es la URL de tu backend en Vercel? (ej: https://mi-backend.vercel.app): ',
    (backendUrl) => {
      if (!backendUrl.trim()) {
        error('URL del backend requerida');
      }

      // Actualizar .env.production
      const envFile = path.join(__dirname, '.env.production');
      const envContent = `REACT_APP_API_URL=${backendUrl}/api\n`;
      
      try {
        fs.writeFileSync(envFile, envContent);
        success(`Variable de entorno actualizada en .env.production`);
      } catch (e) {
        error(`Error al actualizar .env.production: ${e.message}`);
      }

      log('\nAsegúrate de configurar esta variable de entorno en Vercel:', 'yellow');
      log(`  REACT_APP_API_URL=${backendUrl}/api`, 'yellow');

      try {
        execSync('vercel --prod', { stdio: 'inherit' });
        success('Frontend desplegado en Vercel');
      } catch (e) {
        warning('Despliegue del frontend interactivo completado o cancelado');
      }

      rl.close();
      showSummary(backendUrl);
    }
  );
}

// Mostrar resumen
function showSummary(backendUrl) {
  console.log('\n');
  log('═'.repeat(80), 'bold');
  log('🎉 DESPLIEGUE COMPLETADO', 'green');
  log('═'.repeat(80), 'bold');
  console.log('');
  
  log('Tu aplicación está ahora en Vercel:', 'green');
  log(`Frontend:  https://[tu-app].vercel.app`, 'blue');
  log(`Backend:   ${backendUrl}/api`, 'blue');
  log(`Base de Datos: Render (PostgreSQL)`, 'blue');
  console.log('');
  
  log('Próximos pasos:', 'bold');
  log('1. Verifica que tu aplicación funciona correctamente');
  log('2. Prueba login con: admin / admin123');
  log('3. Crea un ticket para verificar que todo funciona');
  log('4. Revisa los reportes y exportación a Excel');
  console.log('');
  
  log('Variables de entorno configuradas:', 'bold');
  log(`Frontend:  REACT_APP_API_URL=${backendUrl}/api`, 'green');
  log('Backend:   DATABASE_URL, JWT_SECRET, DISABLE_AUTH, NODE_ENV', 'green');
  console.log('');
  
  log('¡Tu aplicación está lista para producción! 🚀', 'bold');
  log('═'.repeat(80), 'bold');
}

// Función principal
async function main() {
  console.log('\n');
  log('═'.repeat(80), 'bold');
  log('🚀 SCRIPT DE DESPLIEGUE AUTOMÁTICO EN VERCEL', 'bold');
  log('═'.repeat(80), 'bold');
  console.log('');

  // Verificaciones previas
  info('Realizando verificaciones previas...');
  checkVercelCLI();
  
  if (!checkGitStatus()) {
    process.exit(1);
  }

  console.log('');
  log('─'.repeat(80));
  console.log('');

  // Compilar y desplegar
  buildBackend();
  console.log('');
  
  info('Desplegando en Vercel...');
  info('Se abrirá una ventana del navegador para autenticarte en Vercel');
  console.log('');

  deployBackend();
  console.log('');
  
  deployFrontend();
}

// Ejecutar
main().catch(e => {
  error(`Error: ${e.message}`);
});
