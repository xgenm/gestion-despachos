const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos para desarrollo local
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestion_despachos',
  password: 'postgres',
  port: 5432,
});

async function initDatabase() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('Conectado a la base de datos');
    
    // Crear tablas si no existen
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
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        email TEXT
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        companyId INTEGER REFERENCES companies(id)
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    
    console.log('Tablas creadas exitosamente');
    
    // Insertar datos de ejemplo si no existen
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      await client.query("INSERT INTO users (name) VALUES ('Empresa Ejemplo')");
      console.log('Datos de ejemplo insertados en users');
    }
    
    const equipmentCount = await client.query('SELECT COUNT(*) FROM equipment');
    if (parseInt(equipmentCount.rows[0].count) === 0) {
      await client.query("INSERT INTO equipment (name) VALUES ('Volqueta 1')");
      await client.query("INSERT INTO equipment (name) VALUES ('Volqueta 2')");
      console.log('Datos de ejemplo insertados en equipment');
    }
    
    const operatorCount = await client.query('SELECT COUNT(*) FROM operators');
    if (parseInt(operatorCount.rows[0].count) === 0) {
      await client.query("INSERT INTO operators (name) VALUES ('Operario 1')");
      await client.query("INSERT INTO operators (name) VALUES ('Operario 2')");
      console.log('Datos de ejemplo insertados en operators');
    }
    
    console.log('Base de datos inicializada exitosamente');
  } catch (err) {
    console.error('Error inicializando la base de datos:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Ejecutar la inicialización
initDatabase();