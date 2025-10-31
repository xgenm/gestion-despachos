const { Client } = require('pg');

const DATABASE_URL = 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function updateUsersTable() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL en Render');

    // Verificar si la columna created_by ya existe
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'created_by'
    `);

    if (columnCheck.rows.length === 0) {
      // Agregar columna created_by
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN created_by INTEGER REFERENCES users(id),
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Columnas created_by y created_at agregadas a la tabla users');
    } else {
      console.log('⚠️  La columna created_by ya existe');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updateUsersTable();
