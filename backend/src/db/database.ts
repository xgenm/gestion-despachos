import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', '..', 'dispatches.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    db.serialize(() => {
      // Tabla de Despachos (Estructura corregida)
      db.run(`CREATE TABLE IF NOT EXISTS dispatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        despachoNo TEXT,
        fecha TEXT,
        hora TEXT,
        camion TEXT,
        placa TEXT,
        color TEXT,
        ficha TEXT,
        materials TEXT, -- JSON string
        cliente TEXT,
        celular TEXT,
        recibido TEXT,
        total REAL,
        userId INTEGER,
        equipmentId INTEGER,
        operatorId INTEGER
      )`);

      // Tabla de Usuarios (Empresas)
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`);

      // Tabla de Equipos
      db.run(`CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`);

      // Tabla de Operarios
      db.run(`CREATE TABLE IF NOT EXISTS operators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`);

      // Tabla de Empresas (Clientes que facturan)
      db.run(`CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        email TEXT
      )`);

      // Tabla de Clientes
      db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        companyId INTEGER,
        FOREIGN KEY (companyId) REFERENCES companies (id)
      )`);
    });
  }
});

export default db;