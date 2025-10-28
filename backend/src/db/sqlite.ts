import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db: any = null;

const initializeTables = async () => {
  if (!db) return;

  try {
    // Tabla de Despachos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS dispatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        despachoNo TEXT,
        fecha DATE,
        hora TIME,
        camion TEXT,
        placa TEXT,
        color TEXT,
        ficha TEXT,
        materials TEXT, 
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
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Tabla de Equipos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Tabla de Operarios
    await db.exec(`
      CREATE TABLE IF NOT EXISTS operators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Tabla de Empresas (Clientes que facturan)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        email TEXT
      )
    `);

    // Tabla de Clientes
    await db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        companyId INTEGER REFERENCES companies(id)
      )
    `);

    // Tabla de Administradores (Usuarios con autenticación)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee' NOT NULL
      )
    `);

    console.log('✓ Tablas SQLite inicializadas correctamente');
  } catch (err) {
    console.error('Error al inicializar las tablas:', err);
  }
};

const getConnection = async () => {
  if (db) return db;

  try {
    db = await open({
      filename: path.join(process.cwd(), 'gestion-despachos.db'),
      driver: sqlite3.Database,
    });

    await db.configure('busyTimeout', 5000);
    console.log('✓ Conexión a SQLite establecida correctamente');
    
    await initializeTables();
    return db;
  } catch (err) {
    console.error('Error al conectar a SQLite:', err);
    throw err;
  }
};

export default { open: getConnection, connect: getConnection };
