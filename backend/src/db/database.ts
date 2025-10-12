import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', '..', 'dispatches.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
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
      recibi TEXT,
      total REAL
    )`, (err) => {
      if (err) {
        console.error('Error al crear la tabla', err.message);
      }
    });
  }
});

export default db;
