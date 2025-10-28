import { Pool } from 'pg';
import dotenv from 'dotenv';
import { UserModel } from '../models/User';

dotenv.config();

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Deshabilitar SSL para desarrollo local
});

// Función para inicializar las tablas
const initializeTables = async () => {
  let client;
  try {
    client = await pool.connect();
    
    // Tabla de Despachos
    await client.query(`
      CREATE TABLE IF NOT EXISTS dispatches (
        id SERIAL PRIMARY KEY,
        despachoNo TEXT,
        fecha DATE,
        hora TIME,
        camion TEXT,
        placa TEXT,
        color TEXT,
        ficha TEXT,
        materials TEXT, -- JSON string
        cliente TEXT,
        celular TEXT,
        recibido TEXT,
        total DECIMAL(10, 2),
        userId INTEGER,
        equipmentId INTEGER,
        operatorId INTEGER
      )
    `);

    // Tabla de Usuarios (Empresas)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Tabla de Equipos
    await client.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Tabla de Operarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Tabla de Empresas (Clientes que facturan)
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        email TEXT
      )
    `);

    // Tabla de Clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        companyId INTEGER REFERENCES companies(id)
      )
    `);
    
    // Inicializar tabla de administradores
    await UserModel.createTable();
    
    console.log('Tablas inicializadas correctamente');
  } catch (err) {
    console.error('Error al inicializar las tablas:', err);
    console.log('La aplicación continuará ejecutándose. Las tablas se crearán cuando se establezca la conexión a la base de datos.');
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Inicializar tablas cuando se inicie la aplicación
// No esperamos a que se complete para no bloquear el inicio del servidor
initializeTables().catch(err => {
  console.error('Error durante la inicialización de tablas:', err);
});

// Función para verificar la conexión a la base de datos
const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Conexión a la base de datos establecida correctamente');
    return true;
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err);
    return false;
  }
};

// Verificar la conexión cada 30 segundos si falla inicialmente
const startConnectionChecker = () => {
  const checkConnection = async () => {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Reintentando conexión en 30 segundos...');
      setTimeout(checkConnection, 30000);
    } else {
      // Si la conexión se establece, intentar inicializar las tablas
      initializeTables().catch(err => {
        console.error('Error al inicializar tablas después de conectar:', err);
      });
    }
  };
  
  checkConnection();
};

// Iniciar el verificador de conexión
startConnectionChecker();

export default pool;