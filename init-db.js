const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Pool para conectar a PostgreSQL (default)
const initialPool = new Pool({
  connectionString: 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/postgres?sslmode=require',
  ssl: true
});

// Pool para conectar a gestion_despachos
const dbPool = new Pool({
  connectionString: 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require',
  ssl: true
});

async function initDatabase() {
  let client;
  
  try {
    // Conectar a postgres para crear la BD
    client = await initialPool.connect();
    console.log('Conectado a PostgreSQL');
    
    // Crear la base de datos si no existe
    try {
      await client.query('CREATE DATABASE gestion_despachos');
      console.log('Base de datos gestion_despachos creada');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('Base de datos gestion_despachos ya existe');
      } else {
        throw err;
      }
    }
    
    client.release();
    
    // Ahora conectar a la BD gestion_despachos
    client = await dbPool.connect();
    console.log('Conectado a gestion_despachos');
    
    // Crear tablas
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
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name TEXT,
        role VARCHAR(50) DEFAULT 'employee'
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
    
    console.log('Tablas creadas exitosamente');
    
    // Insertar usuario admin si no existe
    const adminCount = await client.query("SELECT COUNT(*) FROM users WHERE username = 'admin'");
    if (parseInt(adminCount.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'Administrador', 'admin']
      );
      console.log('Usuario admin creado');
    }
    
    // Insertar datos de ejemplo si no existen
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
    await initialPool.end();
    await dbPool.end();
  }
}

// Ejecutar la inicialización
initDatabase();
