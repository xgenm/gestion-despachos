const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function initAdmin() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL en Render');

    // Verificar si la tabla users existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Crear tabla users
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'employee',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabla users creada');
    }

    // Crear tabla dispatches si no existe
    const dispatchesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'dispatches'
      );
    `);

    if (!dispatchesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE dispatches (
          id SERIAL PRIMARY KEY,
          "despachoNo" VARCHAR(50) NOT NULL,
          fecha DATE NOT NULL,
          hora TIME NOT NULL,
          camion VARCHAR(100) NOT NULL,
          placa VARCHAR(20) NOT NULL,
          color VARCHAR(50),
          ficha VARCHAR(50),
          materials JSONB,
          cliente VARCHAR(255) NOT NULL,
          celular VARCHAR(20),
          recibido VARCHAR(255),
          total DECIMAL(10,2) DEFAULT 0,
          "userId" INTEGER,
          "equipmentId" INTEGER,
          "operatorId" INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabla dispatches creada');
    }

    // Verificar si el usuario admin ya existe
    const userCheck = await client.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin']
    );

    if (userCheck.rows.length === 0) {
      // Crear usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Usuario admin creado exitosamente');
      console.log('   Usuario: admin');
      console.log('   Contraseña: admin123');
    } else {
      console.log('⚠️  El usuario admin ya existe');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

initAdmin();
