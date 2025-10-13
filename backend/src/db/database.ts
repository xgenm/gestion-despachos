import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', '..', 'dispatches.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    db.serialize(() => {
      // Tabla de Despachos (Modificada)
      db.run(`CREATE TABLE IF NOT EXISTS dispatches (
        id TEXT PRIMARY KEY,
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
        recibido TEXT, -- Columna renombrada
        total REAL,
        userId TEXT,
        equipmentId TEXT,
        operatorId TEXT
      )`);

      // Nuevas Tablas para Administración
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS operators (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )`);
    });
  }
});

export default db;