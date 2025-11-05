import db from './index';
import dotenv from 'dotenv';

dotenv.config();

const isPostgres = !!process.env.DATABASE_URL;

const postgresSchema = `
  CREATE TABLE IF NOT EXISTS dispatches (
    id SERIAL PRIMARY KEY,
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
  );
  CREATE TABLE IF NOT EXISTS users ( id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE );
  CREATE TABLE IF NOT EXISTS equipment ( id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE );
  CREATE TABLE IF NOT EXISTS operators ( id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE );
  CREATE TABLE IF NOT EXISTS companies ( id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, address TEXT, phone TEXT, email TEXT );
  CREATE TABLE IF NOT EXISTS clients ( id SERIAL PRIMARY KEY, name TEXT NOT NULL, companyId INTEGER REFERENCES companies(id) );
  CREATE TABLE IF NOT EXISTS camiones (
    id SERIAL PRIMARY KEY,
    placa TEXT NOT NULL UNIQUE,
    marca TEXT,
    color TEXT,
    m3 DECIMAL(10, 2),
    ficha TEXT,
    estado TEXT DEFAULT 'activo',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const sqliteSchema = `
  CREATE TABLE IF NOT EXISTS dispatches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    despachoNo TEXT,
    fecha TEXT,
    hora TEXT,
    camion TEXT,
    placa TEXT,
    color TEXT,
    ficha TEXT,
    materials TEXT,
    cliente TEXT,
    celular TEXT,
    recibido TEXT,
    total REAL,
    userId INTEGER,
    equipmentId INTEGER,
    operatorId INTEGER
  );
  CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE );
  CREATE TABLE IF NOT EXISTS equipment ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE );
  CREATE TABLE IF NOT EXISTS operators ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE );
  CREATE TABLE IF NOT EXISTS companies ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, address TEXT, phone TEXT, email TEXT );
  CREATE TABLE IF NOT EXISTS clients ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, companyId INTEGER REFERENCES companies(id) );
  CREATE TABLE IF NOT EXISTS camiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placa TEXT NOT NULL UNIQUE,
    marca TEXT,
    color TEXT,
    m3 REAL,
    ficha TEXT,
    estado TEXT DEFAULT 'activo',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

const initializeTables = async () => {
  try {
    const schema = isPostgres ? postgresSchema : sqliteSchema;
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
      await db.query(statement, []);
    }
    console.log('Tables initialized successfully');
  } catch (err) {
    console.error('Error initializing tables:', err);
  }
};

const checkDatabaseConnection = async () => {
  try {
    const query = isPostgres ? 'SELECT NOW()' : 'SELECT CURRENT_TIMESTAMP';
    await db.query(query, []);
    console.log('Database connection established successfully');
    return true;
  } catch (err) {
    console.error('Could not connect to the database:', err);
    return false;
  }
};

(async () => {
  await initializeTables();
  await checkDatabaseConnection();
})();

export default db.pool;