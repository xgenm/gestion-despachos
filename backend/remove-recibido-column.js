const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function removeRecibidoColumn() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Eliminar columna recibido si existe
    await client.query(`
      ALTER TABLE dispatches 
      DROP COLUMN IF EXISTS recibido
    `);
    console.log('✓ Columna "recibido" eliminada (si existía)');

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

removeRecibidoColumn();
